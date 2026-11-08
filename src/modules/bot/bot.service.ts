import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CatalogoService } from '../catalogo/catalogo.service';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ClientesService } from '../clientes/clientes.service';
import { ConversacionesService } from '../conversaciones/conversaciones.service';
import { Conversacion } from '../conversaciones/entities/conversacion.entity';
import { IaService } from '../ia/ia.service';
import { MensajeIA, NombreProveedor } from '../ia/ia-provider.interface';
import { PedidosService } from '../pedidos/pedidos.service';
import { Vivero } from '../viveros/entities/vivero.entity';
import { ContextoHerramienta } from './herramientas/contexto';
import { HERRAMIENTAS_BOT } from './herramientas/definiciones';
import { EJECUTORES } from './herramientas/registro';

export interface RespuestaBot {
  texto: string;
  derivado: boolean;
  motivoDerivacion?: string;
  proveedor: string;
  modelo: string;
  herramientasUsadas: string[];
}

/**
 * Orquestador del bot. Un turno = mensaje del cliente -> (modelo -> herramientas)* -> texto.
 * No sabe de canales ni de transporte: recibe texto y devuelve texto. Canales lo llama.
 */
@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);
  private readonly promptBase: string;
  private readonly maxIteraciones: number;
  private readonly maxTokens: number;

  constructor(
    private readonly ia: IaService,
    private readonly conversaciones: ConversacionesService,
    private readonly catalogo: CatalogoService,
    private readonly pedidos: PedidosService,
    private readonly clientes: ClientesService,
    config: ConfigService,
  ) {
    this.promptBase = readFileSync(join(__dirname, 'prompts', 'sistema-base.txt'), 'utf8');
    this.maxIteraciones = config.get<number>('ia.maxIteracionesHerramientas') ?? 5;
    this.maxTokens = config.get<number>('ia.maxTokens') ?? 1024;
  }

  async responder(
    vivero: Vivero,
    cliente: Cliente,
    conversacion: Conversacion,
    textoUsuario: string,
  ): Promise<RespuestaBot> {
    const proveedor: NombreProveedor | null = vivero.configuracion.ia.proveedor;
    const sistema = this.armarPrompt(vivero, cliente);
    const historial: MensajeIA[] = [
      ...(conversacion.historialIa ?? []),
      { rol: 'usuario', contenido: textoUsuario },
    ];
    const ctx: ContextoHerramienta = {
      vivero,
      cliente,
      conversacion,
      servicios: {
        catalogo: this.catalogo,
        pedidos: this.pedidos,
        clientes: this.clientes,
        conversaciones: this.conversaciones,
      },
    };
    const herramientasUsadas: string[] = [];
    let modeloUsado = '';
    let proveedorUsado = '';

    try {
      for (let i = 0; i < this.maxIteraciones; i++) {
        const r = await this.ia.generar(
          {
            sistema,
            mensajes: historial,
            herramientas: HERRAMIENTAS_BOT,
            maxTokens: this.maxTokens,
          },
          proveedor,
        );
        modeloUsado = r.modelo;
        proveedorUsado = r.proveedor;
        historial.push({
          rol: 'asistente',
          contenido: r.texto,
          llamadas: r.llamadas.length ? r.llamadas : undefined,
        });

        if (r.llamadas.length === 0) {
          await this.conversaciones.guardarHistorialIa(conversacion, historial);
          const texto =
            r.texto?.trim() ||
            (r.motivoFin === 'rechazo'
              ? 'Disculpá, eso no lo puedo responder. ¿Te ayudo con algo del vivero?'
              : 'Disculpá, no entendí. ¿Me lo repetís?');
          return {
            texto,
            derivado: false,
            proveedor: proveedorUsado,
            modelo: modeloUsado,
            herramientasUsadas,
          };
        }

        for (const llamada of r.llamadas) {
          herramientasUsadas.push(llamada.nombre);
          const resultado = await this.ejecutar(llamada.nombre, llamada.argumentos, ctx);
          historial.push({
            rol: 'resultado_herramienta',
            idLlamada: llamada.id,
            nombre: llamada.nombre,
            contenido: JSON.stringify(resultado.datos),
            esError: resultado.esError,
          });

          if (resultado.derivar) {
            // La derivación corta el ciclo: el mensaje al cliente lo define la herramienta, no el modelo.
            historial.push({ rol: 'asistente', contenido: resultado.derivar.mensajeAlCliente });
            await this.conversaciones.guardarHistorialIa(conversacion, historial);
            return {
              texto: resultado.derivar.mensajeAlCliente,
              derivado: true,
              motivoDerivacion: resultado.derivar.motivo,
              proveedor: proveedorUsado,
              modelo: modeloUsado,
              herramientasUsadas,
            };
          }
        }
      }
      await this.conversaciones.guardarHistorialIa(conversacion, historial);
      return {
        texto:
          'Me enredé buscando eso. ¿Me lo preguntás de otra forma o preferís que te pase con una persona?',
        derivado: false,
        proveedor: proveedorUsado,
        modelo: modeloUsado,
        herramientasUsadas,
      };
    } catch (error) {
      this.logger.error(
        `Error del bot en conversación ${conversacion.id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      return {
        texto:
          'Uy, tuve un problema para responderte. Probá de nuevo en un momento o escribí "hablar con una persona" y te atiende alguien del vivero.',
        derivado: false,
        proveedor: proveedorUsado || 'desconocido',
        modelo: modeloUsado || 'desconocido',
        herramientasUsadas,
      };
    }
  }

  /** Resumen para el empleado que toma una conversación derivada. */
  async resumirConversacion(vivero: Vivero, conversacion: Conversacion): Promise<string> {
    const texto = (conversacion.historialIa ?? [])
      .filter((m) => m.rol === 'usuario' || (m.rol === 'asistente' && m.contenido))
      .map((m) => `${m.rol === 'usuario' ? 'Cliente' : 'Bot'}: ${(m as any).contenido}`)
      .join('\n');
    if (!texto) return 'Sin mensajes previos.';
    const resumen = await this.ia.completar(
      'Resumí en tres líneas, en español, qué necesita el cliente y qué se le respondió. Solo el resumen.',
      texto,
      vivero.configuracion.ia.proveedor,
      300,
    );
    await this.conversaciones.guardarResumen(conversacion, resumen);
    return resumen;
  }

  private async ejecutar(nombre: string, args: Record<string, unknown>, ctx: ContextoHerramienta) {
    const ejecutor = EJECUTORES[nombre];
    if (!ejecutor) return { datos: { error: `Herramienta desconocida: ${nombre}` }, esError: true };
    try {
      return await ejecutor(args, ctx);
    } catch (error) {
      this.logger.warn(`Herramienta ${nombre} falló: ${(error as Error).message}`);
      return {
        datos: { error: (error as Error).message ?? 'Error ejecutando la herramienta' },
        esError: true,
      };
    }
  }

  private armarPrompt(vivero: Vivero, cliente: Cliente): string {
    const datosVivero = [
      `Nombre: ${vivero.nombre}`,
      `Horarios: ${vivero.configuracion.horarios}`,
      vivero.direccion
        ? `Dirección: ${vivero.direccion}${vivero.ciudad ? `, ${vivero.ciudad}` : ''}`
        : null,
      vivero.telefono ? `Teléfono: ${vivero.telefono}` : null,
      `Envíos: ${vivero.configuracion.pedidos.permiteEnvio ? `sí (costo base $${vivero.configuracion.pedidos.costoEnvioBase})` : 'no'}. Retiro en el vivero: ${vivero.configuracion.pedidos.permiteRetiro ? 'sí' : 'no'}.`,
      `Fecha y hora actual: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`,
    ]
      .filter(Boolean)
      .join('\n');

    const perfil =
      cliente.perfilJardin && Object.keys(cliente.perfilJardin).length
        ? `Perfil de jardín: ${JSON.stringify(cliente.perfilJardin)}`
        : 'Sin datos de perfil de jardín.';
    const datosCliente = `Nombre: ${cliente.nombre}\n${perfil}`;

    return this.promptBase
      .replace('{{NOMBRE_BOT}}', vivero.configuracion.ia.nombreBot || 'Flora')
      .replace('{{NOMBRE_VIVERO}}', vivero.nombre)
      .replace('{{DATOS_VIVERO}}', datosVivero)
      .replace('{{DATOS_CLIENTE}}', datosCliente)
      .replace(
        '{{INSTRUCCIONES_EXTRA}}',
        vivero.configuracion.ia.instruccionesExtra
          ? `## Instrucciones del vivero\n${vivero.configuracion.ia.instruccionesExtra}`
          : '',
      );
  }
}
