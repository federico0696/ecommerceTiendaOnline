import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Canal } from '../../common/enums';
import { BotService } from '../bot/bot.service';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ClientesService } from '../clientes/clientes.service';
import { ConversacionesService } from '../conversaciones/conversaciones.service';
import { Conversacion, ModoConversacion } from '../conversaciones/entities/conversacion.entity';
import { EmisorMensaje, Mensaje, TipoMensaje } from '../conversaciones/entities/mensaje.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { WhatsappService } from '../notificaciones/proveedores/whatsapp.service';
import { EventosRT, RealtimeService } from '../realtime/realtime.service';
import { ViverosService } from '../viveros/viveros.service';

export interface MensajeEntrante {
  viveroId: string;
  canal: Canal;
  cliente: Cliente;
  texto: string;
  tipo?: TipoMensaje;
  metadata?: Record<string, unknown>;
}

/**
 * ORQUESTADOR OMNICANAL. Es el único que sabe el flujo completo:
 *
 *   mensaje del cliente (app / web / WhatsApp)
 *     -> se guarda
 *     -> si la conversación está en modo BOT: responde el bot (y puede derivar)
 *     -> si está en modo HUMANO: se avisa al panel y espera a un empleado
 *     -> la respuesta se ENTREGA por el mismo canal por el que llegó
 *
 * Los controladores de cada canal solo traducen su transporte a `MensajeEntrante`.
 */
@Injectable()
export class CanalesService {
  private readonly logger = new Logger(CanalesService.name);

  constructor(
    private readonly conversaciones: ConversacionesService,
    private readonly bot: BotService,
    private readonly viveros: ViverosService,
    private readonly clientes: ClientesService,
    private readonly realtime: RealtimeService,
    private readonly notificaciones: NotificacionesService,
    private readonly whatsapp: WhatsappService,
  ) {}

  async procesarEntrante(
    entrante: MensajeEntrante,
  ): Promise<{ conversacion: Conversacion; mensajeCliente: Mensaje; respuesta: Mensaje | null }> {
    const vivero = await this.viveros.obtener(entrante.viveroId);
    const conversacion = await this.conversaciones.obtenerOAbrir(
      vivero.id,
      entrante.cliente.id,
      entrante.canal,
    );

    const mensajeCliente = await this.conversaciones.agregarMensaje(conversacion, {
      emisor: EmisorMensaje.CLIENTE,
      emisorId: entrante.cliente.id,
      contenido: entrante.texto,
      tipo: entrante.tipo,
      metadata: entrante.metadata,
    });
    this.realtime.aVivero(vivero.id, EventosRT.MENSAJE_NUEVO, {
      conversacionId: conversacion.id,
      mensaje: mensajeCliente,
    });
    this.realtime.aVivero(
      vivero.id,
      EventosRT.CONVERSACION_ACTUALIZADA,
      this.resumenConversacion(conversacion, entrante.cliente),
    );

    if (conversacion.modo === ModoConversacion.HUMANO) {
      // Alguien del vivero tiene que contestar. Si está asignada, se le avisa a esa persona.
      if (conversacion.asignadoAId)
        this.realtime.aUsuario(conversacion.asignadoAId, EventosRT.MENSAJE_NUEVO, {
          conversacionId: conversacion.id,
          mensaje: mensajeCliente,
        });
      return { conversacion, mensajeCliente, respuesta: null };
    }

    const r = await this.bot.responder(vivero, entrante.cliente, conversacion, entrante.texto);
    const respuesta = await this.conversaciones.agregarMensaje(conversacion, {
      emisor: EmisorMensaje.BOT,
      contenido: r.texto,
      metadata: { proveedor: r.proveedor, modelo: r.modelo, herramientas: r.herramientasUsadas },
    });
    await this.entregarAlCliente(
      conversacion,
      entrante.cliente,
      respuesta,
      vivero.configuracion.canales.whatsappPhoneNumberId,
    );

    if (r.derivado) {
      await this.conversaciones.agregarMensaje(conversacion, {
        emisor: EmisorMensaje.SISTEMA,
        contenido: `Derivada a un empleado. Motivo: ${r.motivoDerivacion}`,
      });
      this.bot
        .resumirConversacion(vivero, conversacion)
        .catch((e) => this.logger.warn(`No se pudo resumir: ${e.message}`));
      this.realtime.aVivero(vivero.id, EventosRT.CONVERSACION_ACTUALIZADA, {
        ...this.resumenConversacion(conversacion, entrante.cliente),
        derivada: true,
        motivo: r.motivoDerivacion,
      });
    }
    return { conversacion, mensajeCliente, respuesta };
  }

  /** Un empleado responde desde el panel. Se guarda y se entrega por el canal de la conversación. */
  async responderDesdePanel(
    viveroId: string,
    conversacionId: string,
    usuarioId: string,
    texto: string,
  ): Promise<Mensaje> {
    const conversacion = await this.conversaciones.obtener(viveroId, conversacionId);
    if (conversacion.modo === ModoConversacion.BOT) {
      // Si un empleado escribe, toma la conversación: el bot deja de responder.
      await this.conversaciones.asignar(conversacion, usuarioId, 'Un empleado intervino');
    } else if (conversacion.asignadoAId && conversacion.asignadoAId !== usuarioId) {
      throw new ForbiddenException('Esta conversación está asignada a otro empleado');
    } else if (!conversacion.asignadoAId) {
      await this.conversaciones.asignar(conversacion, usuarioId);
    }
    const mensaje = await this.conversaciones.agregarMensaje(conversacion, {
      emisor: EmisorMensaje.EMPLEADO,
      emisorId: usuarioId,
      contenido: texto,
    });
    const vivero = await this.viveros.obtener(viveroId);
    await this.entregarAlCliente(
      conversacion,
      conversacion.cliente,
      mensaje,
      vivero.configuracion.canales.whatsappPhoneNumberId,
      true,
    );
    this.realtime.aVivero(viveroId, EventosRT.MENSAJE_NUEVO, { conversacionId, mensaje });
    return mensaje;
  }

  async devolverAlBot(viveroId: string, conversacionId: string): Promise<Conversacion> {
    const conversacion = await this.conversaciones.obtener(viveroId, conversacionId);
    const c = await this.conversaciones.devolverAlBot(conversacion);
    await this.conversaciones.agregarMensaje(c, {
      emisor: EmisorMensaje.SISTEMA,
      contenido: 'La conversación volvió al asistente virtual.',
    });
    this.realtime.aVivero(
      viveroId,
      EventosRT.CONVERSACION_ACTUALIZADA,
      this.resumenConversacion(c, conversacion.cliente),
    );
    return c;
  }

  /** Entrega según canal: app/web por socket (+ push si es un humano quien escribe), WhatsApp por Meta. */
  private async entregarAlCliente(
    conversacion: Conversacion,
    cliente: Cliente,
    mensaje: Mensaje,
    phoneNumberId: string | null,
    avisarPush = false,
  ) {
    switch (conversacion.canal) {
      case Canal.WHATSAPP:
        if (cliente.whatsapp) {
          const r = await this.whatsapp.enviarTexto(
            cliente.whatsapp,
            mensaje.contenido,
            phoneNumberId,
          );
          this.logger.debug(`WhatsApp -> ${cliente.whatsapp} ${r.simulado ? '(simulado)' : r.id}`);
        }
        break;
      case Canal.APP:
      case Canal.WEB:
      default:
        this.realtime.aCliente(cliente.id, EventosRT.MENSAJE_NUEVO, {
          conversacionId: conversacion.id,
          mensaje,
        });
        if (avisarPush && conversacion.canal === Canal.APP) {
          await this.notificaciones.notificarPush(
            conversacion.viveroId,
            [cliente.id],
            'Nuevo mensaje del vivero',
            mensaje.contenido.slice(0, 120),
            { tipo: 'chat', conversacionId: conversacion.id },
            'chat',
          );
        }
    }
  }

  private resumenConversacion(c: Conversacion, cliente: Cliente) {
    return {
      id: c.id,
      canal: c.canal,
      modo: c.modo,
      estado: c.estado,
      asignadoAId: c.asignadoAId,
      ultimoMensajeEn: c.ultimoMensajeEn,
      ultimoMensajeTexto: c.ultimoMensajeTexto,
      noLeidosPanel: c.noLeidosPanel,
      cliente: { id: cliente.id, nombre: cliente.nombre },
    };
  }
}
