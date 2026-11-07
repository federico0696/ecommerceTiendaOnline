import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import { EstadoPedido, Pedido } from './entities/pedido.entity';

/**
 * Bus de eventos de pedidos. Desacopla Pedidos de Notificaciones y Realtime:
 * Pedidos emite, los demás escuchan. Así ningún módulo "sabe" del otro.
 * (Si el proyecto crece, esto se reemplaza por @nestjs/event-emitter o una cola sin tocar a Pedidos.)
 */
export const EVENTO_PEDIDO_CREADO = 'pedido.creado';
export const EVENTO_PEDIDO_ESTADO = 'pedido.estado';

export interface EventoPedidoEstado {
  pedido: Pedido;
  anterior: EstadoPedido;
}

@Injectable()
export class EventosPedidos {
  private readonly logger = new Logger(EventosPedidos.name);
  private readonly emitter = new EventEmitter();

  pedidoCreado(pedido: Pedido) {
    this.logger.debug(`Pedido #${pedido.numero} creado (${pedido.viveroId})`);
    this.emitter.emit(EVENTO_PEDIDO_CREADO, pedido);
  }

  estadoCambiado(pedido: Pedido, anterior: EstadoPedido) {
    this.logger.debug(`Pedido #${pedido.numero}: ${anterior} -> ${pedido.estado}`);
    this.emitter.emit(EVENTO_PEDIDO_ESTADO, { pedido, anterior } as EventoPedidoEstado);
  }

  onPedidoCreado(cb: (pedido: Pedido) => void) {
    this.emitter.on(EVENTO_PEDIDO_CREADO, cb);
  }
  onEstadoCambiado(cb: (e: EventoPedidoEstado) => void) {
    this.emitter.on(EVENTO_PEDIDO_ESTADO, cb);
  }
}
