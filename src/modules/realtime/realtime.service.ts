import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

/** Fachada para emitir eventos. Los nombres de evento están centralizados acá. */
export const EventosRT = {
  MENSAJE_NUEVO: 'mensaje:nuevo',
  CONVERSACION_ACTUALIZADA: 'conversacion:actualizada',
  PEDIDO_NUEVO: 'pedido:nuevo',
  PEDIDO_ACTUALIZADO: 'pedido:actualizado',
  NOTIFICACION: 'notificacion',
} as const;

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  aVivero(viveroId: string, evento: string, payload: unknown) {
    this.gateway.server?.to(RealtimeGateway.salaVivero(viveroId)).emit(evento, payload);
  }

  aCliente(clienteId: string, evento: string, payload: unknown) {
    this.gateway.server?.to(RealtimeGateway.salaCliente(clienteId)).emit(evento, payload);
  }

  aUsuario(usuarioId: string, evento: string, payload: unknown) {
    this.gateway.server?.to(RealtimeGateway.salaUsuario(usuarioId)).emit(evento, payload);
  }
}
