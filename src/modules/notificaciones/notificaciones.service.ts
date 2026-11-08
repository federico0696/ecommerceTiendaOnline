import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginacionDto, paginar } from '../../common/dto/paginacion.dto';
import { ClientesService } from '../clientes/clientes.service';
import { Cliente } from '../clientes/entities/cliente.entity';
import { EstadoPedido, Pedido } from '../pedidos/entities/pedido.entity';
import { EventosPedidos } from '../pedidos/pedidos.eventos';
import { EventosRT, RealtimeService } from '../realtime/realtime.service';
import { EnviarNotificacionDto } from './dto/enviar-notificacion.dto';
import {
  CanalNotificacion,
  EstadoNotificacion,
  Notificacion,
} from './entities/notificacion.entity';
import { EmailService } from './proveedores/email.service';
import { PushFirebaseService } from './proveedores/push-firebase.service';
import { WhatsappService } from './proveedores/whatsapp.service';

const TEXTO_ESTADO: Partial<Record<EstadoPedido, string>> = {
  [EstadoPedido.CONFIRMADO]: 'El vivero confirmó tu pedido. ¡Ya lo estamos preparando!',
  [EstadoPedido.PREPARANDO]: 'Tu pedido está en preparación.',
  [EstadoPedido.LISTO]: 'Tu pedido está listo.',
  [EstadoPedido.EN_CAMINO]: 'Tu pedido salió hacia tu casa.',
  [EstadoPedido.ENTREGADO]: 'Tu pedido fue entregado. ¡Que lo disfrutes!',
  [EstadoPedido.CANCELADO]: 'Tu pedido fue cancelado. Si tenés dudas, escribinos por el chat.',
};

/**
 * Único lugar desde el que salen notificaciones. Decide canal, registra en la tabla
 * y escucha eventos del sistema (pedidos) para avisar solo.
 */
@Injectable()
export class NotificacionesService implements OnModuleInit {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(Notificacion) private readonly repo: Repository<Notificacion>,
    @InjectRepository(Cliente) private readonly clientesRepo: Repository<Cliente>,
    private readonly clientes: ClientesService,
    private readonly push: PushFirebaseService,
    private readonly whatsapp: WhatsappService,
    private readonly email: EmailService,
    private readonly eventosPedidos: EventosPedidos,
    private readonly realtime: RealtimeService,
  ) {}

  onModuleInit() {
    this.eventosPedidos.onPedidoCreado((p) =>
      this.alCrearPedido(p).catch((e) => this.logger.error(e)),
    );
    this.eventosPedidos.onEstadoCambiado(({ pedido }) =>
      this.alCambiarEstado(pedido).catch((e) => this.logger.error(e)),
    );
  }

  /** Push a uno o varios clientes. Se usa para chat, pedidos y campañas. */
  async notificarPush(
    viveroId: string,
    clienteIds: string[],
    titulo: string,
    cuerpo: string,
    datos: Record<string, unknown> = {},
    origen = 'sistema',
    usuarioId: string | null = null,
  ) {
    const dispositivos = await this.clientes.tokensPush(clienteIds);
    const porCliente = new Map<string, string[]>();
    for (const d of dispositivos)
      porCliente.set(d.clienteId, [...(porCliente.get(d.clienteId) ?? []), d.tokenFcm]);

    let totalEnviados = 0;
    for (const clienteId of clienteIds) {
      const tokens = porCliente.get(clienteId) ?? [];
      const registro = this.repo.create({
        viveroId,
        clienteId,
        canal: CanalNotificacion.PUSH,
        titulo,
        cuerpo,
        datos,
        origen,
        usuarioId,
      });
      if (tokens.length === 0) {
        registro.estado = EstadoNotificacion.FALLIDA;
        registro.error = 'El cliente no tiene dispositivos registrados';
      } else {
        try {
          const r = await this.push.enviar(tokens, titulo, cuerpo, datos);
          for (const t of r.tokensInvalidos) await this.clientes.desactivarToken(t);
          registro.estado = r.simulado
            ? EstadoNotificacion.SIMULADA
            : r.enviados > 0
              ? EstadoNotificacion.ENVIADA
              : EstadoNotificacion.FALLIDA;
          totalEnviados += r.enviados;
        } catch (e) {
          registro.estado = EstadoNotificacion.FALLIDA;
          registro.error = (e as Error).message;
        }
      }
      await this.repo.save(registro);
      // Además del push, el evento en tiempo real para que la app actualice si está abierta.
      this.realtime.aCliente(clienteId, EventosRT.NOTIFICACION, { titulo, cuerpo, datos });
    }
    return { clientes: clienteIds.length, enviados: totalEnviados };
  }

  async notificarWhatsapp(
    viveroId: string,
    cliente: Cliente,
    texto: string,
    phoneNumberId: string | null,
    origen = 'sistema',
    usuarioId: string | null = null,
  ) {
    const registro = this.repo.create({
      viveroId,
      clienteId: cliente.id,
      canal: CanalNotificacion.WHATSAPP,
      titulo: 'WhatsApp',
      cuerpo: texto,
      origen,
      usuarioId,
    });
    if (!cliente.whatsapp) {
      registro.estado = EstadoNotificacion.FALLIDA;
      registro.error = 'El cliente no tiene WhatsApp cargado';
    } else {
      try {
        const r = await this.whatsapp.enviarTexto(cliente.whatsapp, texto, phoneNumberId);
        registro.estado = r.simulado ? EstadoNotificacion.SIMULADA : EstadoNotificacion.ENVIADA;
        registro.datos = { idMeta: r.id };
      } catch (e) {
        registro.estado = EstadoNotificacion.FALLIDA;
        registro.error = (e as Error).message;
      }
    }
    return this.repo.save(registro);
  }

  async notificarEmail(
    viveroId: string,
    cliente: Cliente,
    asunto: string,
    html: string,
    origen = 'sistema',
  ) {
    const registro = this.repo.create({
      viveroId,
      clienteId: cliente.id,
      canal: CanalNotificacion.EMAIL,
      titulo: asunto,
      cuerpo: html,
      origen,
    });
    try {
      const r = await this.email.enviar(cliente.email, asunto, html);
      registro.estado = r.simulado ? EstadoNotificacion.SIMULADA : EstadoNotificacion.ENVIADA;
    } catch (e) {
      registro.estado = EstadoNotificacion.FALLIDA;
      registro.error = (e as Error).message;
    }
    return this.repo.save(registro);
  }

  /** Envío manual o campaña desde el panel. */
  async enviarDesdePanel(viveroId: string, dto: EnviarNotificacionDto, usuarioId: string) {
    let clientes: Cliente[];
    if (dto.clienteIds?.length) {
      clientes = await this.clientesRepo.findByIds(dto.clienteIds);
      clientes = clientes.filter((c) => c.viveroId === viveroId);
    } else {
      clientes = await this.clientesRepo.find({
        where: { viveroId, activo: true, aceptaNotificaciones: true },
      });
    }
    const origen = dto.clienteIds?.length ? 'manual' : 'campania';

    if (dto.canal === CanalNotificacion.PUSH) {
      return this.notificarPush(
        viveroId,
        clientes.map((c) => c.id),
        dto.titulo,
        dto.cuerpo,
        dto.datos ?? {},
        origen,
        usuarioId,
      );
    }
    let enviados = 0;
    for (const c of clientes) {
      const r =
        dto.canal === CanalNotificacion.WHATSAPP
          ? await this.notificarWhatsapp(
              viveroId,
              c,
              `${dto.titulo}\n\n${dto.cuerpo}`,
              null,
              origen,
              usuarioId,
            )
          : await this.notificarEmail(viveroId, c, dto.titulo, `<p>${dto.cuerpo}</p>`, origen);
      if (r.estado !== EstadoNotificacion.FALLIDA) enviados++;
    }
    return { clientes: clientes.length, enviados };
  }

  historial(viveroId: string, dto: PaginacionDto) {
    return this.repo
      .findAndCount({
        where: { viveroId },
        order: { creadoEn: 'DESC' },
        skip: dto.skip,
        take: dto.limite,
      })
      .then(([datos, total]) => paginar(datos, total, dto));
  }

  // ----- reacciones a eventos -----

  private async alCrearPedido(pedido: Pedido) {
    this.realtime.aVivero(pedido.viveroId, EventosRT.PEDIDO_NUEVO, {
      id: pedido.id,
      numero: pedido.numero,
      total: pedido.total,
    });
    await this.notificarPush(
      pedido.viveroId,
      [pedido.clienteId],
      `Pedido #${pedido.numero} recibido`,
      'Te avisamos cuando el vivero lo confirme.',
      { tipo: 'pedido', pedidoId: pedido.id },
      'pedido',
    );
  }

  private async alCambiarEstado(pedido: Pedido) {
    this.realtime.aVivero(pedido.viveroId, EventosRT.PEDIDO_ACTUALIZADO, {
      id: pedido.id,
      numero: pedido.numero,
      estado: pedido.estado,
    });
    this.realtime.aCliente(pedido.clienteId, EventosRT.PEDIDO_ACTUALIZADO, {
      id: pedido.id,
      numero: pedido.numero,
      estado: pedido.estado,
    });
    const texto = TEXTO_ESTADO[pedido.estado];
    if (texto)
      await this.notificarPush(
        pedido.viveroId,
        [pedido.clienteId],
        `Pedido #${pedido.numero}`,
        texto,
        { tipo: 'pedido', pedidoId: pedido.id },
        'pedido',
      );
  }
}
