import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type {
  BetaContentBlockParam,
  BetaMessageParam,
  BetaTool,
  BetaToolResultBlockParam,
} from '@anthropic-ai/sdk/resources/beta/messages/messages';
import {
  HerramientaIA,
  LlamadaHerramienta,
  MensajeIA,
  ProveedorIA,
  RespuestaIA,
  SolicitudIA,
} from '../ia-provider.interface';

/**
 * Traduce el contrato neutro al Messages API de Anthropic (Claude).
 * - Thinking adaptativo: no se manda el parámetro, el modelo decide.
 * - Fallback del lado del servidor: si un pedido es rechazado por los clasificadores de
 *   seguridad, la API lo reintenta sola en un modelo alternativo (fallbacks: 'default').
 */
@Injectable()
export class AnthropicProvider implements ProveedorIA {
  readonly nombre = 'anthropic' as const;
  private readonly logger = new Logger(AnthropicProvider.name);
  private cliente: Anthropic | null = null;
  private readonly apiKey: string;
  private readonly modeloDefault: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('ia.anthropic.apiKey') ?? '';
    this.modeloDefault = config.get<string>('ia.anthropic.modelo') ?? 'claude-opus-5-5';
  }

  disponible() {
    return Boolean(this.apiKey) && !this.apiKey.includes('ficticia');
  }

  async generar(s: SolicitudIA): Promise<RespuestaIA> {
    const modelo = s.modelo ?? this.modeloDefault;
    const respuesta = await this.getCliente().beta.messages.create({
      model: modelo,
      max_tokens: s.maxTokens ?? 1024,
      system: s.sistema,
      messages: this.aMensajesAnthropic(s.mensajes),
      tools: s.herramientas?.length ? s.herramientas.map(this.aHerramientaAnthropic) : undefined,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });

    let texto = '';
    const llamadas: LlamadaHerramienta[] = [];
    for (const bloque of respuesta.content) {
      if (bloque.type === 'text') texto += bloque.text;
      else if (bloque.type === 'tool_use')
        llamadas.push({
          id: bloque.id,
          nombre: bloque.name,
          argumentos: (bloque.input ?? {}) as Record<string, unknown>,
        });
    }
    if (respuesta.stop_reason === 'refusal')
      this.logger.warn(`Respuesta rechazada por seguridad (${modelo})`);

    return {
      texto: texto || null,
      llamadas,
      motivoFin: this.motivo(respuesta.stop_reason, llamadas.length),
      proveedor: this.nombre,
      modelo: respuesta.model ?? modelo,
      uso: {
        tokensEntrada: respuesta.usage.input_tokens,
        tokensSalida: respuesta.usage.output_tokens,
      },
    };
  }

  private getCliente(): Anthropic {
    if (!this.cliente) this.cliente = new Anthropic({ apiKey: this.apiKey });
    return this.cliente;
  }

  private aHerramientaAnthropic = (h: HerramientaIA): BetaTool => ({
    name: h.nombre,
    description: h.descripcion,
    input_schema: h.parametros as BetaTool['input_schema'],
  });

  /** Anthropic exige alternar user/assistant; los resultados de herramientas van en un solo turno user. */
  private aMensajesAnthropic(mensajes: MensajeIA[]): BetaMessageParam[] {
    const salida: BetaMessageParam[] = [];
    for (const m of mensajes) {
      if (m.rol === 'usuario') {
        salida.push({ role: 'user', content: m.contenido });
      } else if (m.rol === 'asistente') {
        const content: BetaContentBlockParam[] = [];
        if (m.contenido) content.push({ type: 'text', text: m.contenido });
        for (const l of m.llamadas ?? [])
          content.push({ type: 'tool_use', id: l.id, name: l.nombre, input: l.argumentos });
        if (content.length) salida.push({ role: 'assistant', content });
      } else {
        const bloque: BetaToolResultBlockParam = {
          type: 'tool_result',
          tool_use_id: m.idLlamada,
          content: m.contenido,
          is_error: m.esError ?? false,
        };
        const anterior = salida[salida.length - 1];
        if (
          anterior?.role === 'user' &&
          Array.isArray(anterior.content) &&
          anterior.content.every((b) => b.type === 'tool_result')
        ) {
          (anterior.content as BetaToolResultBlockParam[]).push(bloque);
        } else {
          salida.push({ role: 'user', content: [bloque] });
        }
      }
    }
    return salida;
  }

  private motivo(fin: string | null, llamadas: number): RespuestaIA['motivoFin'] {
    if (llamadas > 0 || fin === 'tool_use') return 'herramientas';
    if (fin === 'max_tokens') return 'longitud';
    if (fin === 'refusal') return 'rechazo';
    if (fin === 'end_turn' || fin === 'stop_sequence') return 'fin';
    return 'otro';
  }
}
