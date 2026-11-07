import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Rol } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';

/**
 * Tiempo real para app y panel con Socket.IO.
 * Conexión: el cliente manda el JWT en `auth.token`. Según el rol entra a su sala:
 *  - panel (root/admin/empleado): sala `vivero:{id}` (root puede pedir un vivero con auth.viveroId)
 *  - cliente (app/web): sala `cliente:{id}`
 * Los módulos emiten con RealtimeService, nunca directamente con el server.
 */
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/rt' })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwt: JwtService) {}

  handleConnection(socket: Socket) {
    try {
      const token =
        (socket.handshake.auth?.token as string) ??
        (socket.handshake.headers.authorization ?? '').replace('Bearer ', '');
      const user = this.jwt.verify<UsuarioAutenticado>(token);
      socket.data.user = user;
      if (user.rol === Rol.CLIENTE) {
        socket.join(RealtimeGateway.salaCliente(user.sub));
      } else {
        const viveroId =
          user.rol === Rol.ROOT ? (socket.handshake.auth?.viveroId as string) : user.viveroId;
        if (viveroId) socket.join(RealtimeGateway.salaVivero(viveroId));
        socket.join(RealtimeGateway.salaUsuario(user.sub));
      }
      this.logger.debug(`Conectado ${user.tipo} ${user.email}`);
    } catch {
      socket.emit('error', { mensaje: 'Token inválido' });
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    const user: UsuarioAutenticado | undefined = socket.data.user;
    if (user) this.logger.debug(`Desconectado ${user.tipo} ${user.email}`);
  }

  /** El panel avisa que un empleado está escribiendo; se reenvía al cliente. */
  @SubscribeMessage('escribiendo')
  escribiendo(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { clienteId?: string; conversacionId: string },
  ) {
    const user: UsuarioAutenticado = socket.data.user;
    if (user.rol === Rol.CLIENTE) {
      this.server
        .to(RealtimeGateway.salaVivero(user.viveroId as string))
        .emit('cliente:escribiendo', { clienteId: user.sub, conversacionId: body.conversacionId });
    } else if (body.clienteId) {
      this.server
        .to(RealtimeGateway.salaCliente(body.clienteId))
        .emit('empleado:escribiendo', { conversacionId: body.conversacionId, nombre: user.nombre });
    }
  }

  static salaVivero(viveroId: string) {
    return `vivero:${viveroId}`;
  }
  static salaCliente(clienteId: string) {
    return `cliente:${clienteId}`;
  }
  static salaUsuario(usuarioId: string) {
    return `usuario:${usuarioId}`;
  }
}
