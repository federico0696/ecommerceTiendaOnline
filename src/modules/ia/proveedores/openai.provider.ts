import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';
import {
  LlamadaHerramienta,
  MensajeIA,
  ProveedorIA,
  RespuestaIA,
  SolicitudIA,
} from '../ia-provider.interface';

/** Traduce el contrato neutro al Chat Completions API de OpenAI (con function calling). */
@Injectable()
export class OpenAIProvider implements ProveedorIA {
  readonly nombre = 'openai' as const;
  private readonly logger = new Logger(OpenAIProvider.name);
  private cliente: OpenAI | null = null;
  private readonly apiKey: string;
  private readonly modeloDefault: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('ia.openai.apiKey') ?? '';
    this.modeloDefault = config.get<string>('ia.openai.modelo') ?? 'gpt-4.1';
  }

  disponible() {
    return Boolean(this.apiKey) && !this.apiKey.includes('ficticia');
  }

  async generar(s: SolicitudIA): Promise<RespuestaIA> {
    const modelo = s.modelo ?? this.modeloDefault;
    const respuesta = await this.getCliente().chat.completions.create({
      model: modelo,
      max_completion_tokens: s.maxTokens,
      messages: [{ role: 'system', content: s.sistema }, ...this.aMensajesOpenAI(s.mensajes)],
      tools: s.herramientas?.length ? s.herramientas.map(this.aHerramientaOpenAI) : undefined,
    });

    const eleccion = respuesta.choices[0];
    const llamadas: LlamadaHerramienta[] = [];
    for (const tc of eleccion.message.tool_calls ?? []) {
      if (tc.type !== 'function') continue;
      llamadas.push({
        id: tc.id,
        nombre: tc.function.name,
        argumentos: this.parsearJson(tc.function.arguments),
      });
    }
    return {
      texto: eleccion.message.content ?? null,
      llamadas,
      motivoFin: this.motivo(eleccion.finish_reason, llamadas.length),
      proveedor: this.nombre,
      modelo,
      uso: {
        tokensEntrada: respuesta.usage?.prompt_tokens ?? 0,
        tokensSalida: respuesta.usage?.completion_tokens ?? 0,
      },
    };
  }

  private getCliente(): OpenAI {
    if (!this.cliente) this.cliente = new OpenAI({ apiKey: this.apiKey });
    return this.cliente;
  }

  private aHerramientaOpenAI = (
    h: SolicitudIA['herramientas'] extends (infer T)[] | undefined ? T : never,
  ): ChatCompletionTool => ({
    type: 'function',
    function: { name: h.nombre, description: h.descripcion, parameters: h.parametros },
  });

  private aMensajesOpenAI(mensajes: MensajeIA[]): ChatCompletionMessageParam[] {
    return mensajes.map((m): ChatCompletionMessageParam => {
      switch (m.rol) {
        case 'usuario':
          return { role: 'user', content: m.contenido };
        case 'asistente':
          return {
            role: 'assistant',
            content: m.contenido,
            tool_calls: m.llamadas?.length
              ? m.llamadas.map((l) => ({
                  id: l.id,
                  type: 'function' as const,
                  function: { name: l.nombre, arguments: JSON.stringify(l.argumentos) },
                }))
              : undefined,
          };
        case 'resultado_herramienta':
          return { role: 'tool', tool_call_id: m.idLlamada, content: m.contenido };
      }
    });
  }

  private motivo(fin: string | null | undefined, llamadas: number): RespuestaIA['motivoFin'] {
    if (llamadas > 0 || fin === 'tool_calls') return 'herramientas';
    if (fin === 'length') return 'longitud';
    if (fin === 'content_filter') return 'rechazo';
    if (fin === 'stop') return 'fin';
    return 'otro';
  }

  private parsearJson(texto: string): Record<string, unknown> {
    try {
      return JSON.parse(texto || '{}');
    } catch {
      this.logger.warn(`Argumentos no parseables: ${texto}`);
      return {};
    }
  }
}
