import { Column, Entity, Index } from 'typeorm';
import { EntidadVivero } from '../../../common/entities';

export enum CanalNotificacion {
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

export enum EstadoNotificacion {
  PENDIENTE = 'pendiente',
  ENVIADA = 'enviada',
  FALLIDA = 'fallida',
  SIMULADA = 'simulada', // la integración está deshabilitada: se registró pero no salió
}

/** Registro de cada notificación enviada (o intentada). Es la base de la pantalla "Campañas" del panel. */
@Entity('notificaciones')
@Index(['viveroId', 'creadoEn'])
export class Notificacion extends EntidadVivero {
  @Column({ name: 'cliente_id', type: 'uuid', nullable: true })
  clienteId: string | null;

  @Column({ type: 'enum', enum: CanalNotificacion })
  canal: CanalNotificacion;

  @Column({ length: 160 })
  titulo: string;

  @Column({ type: 'text' })
  cuerpo: string;

  /** Deep link, id de pedido, etc. Lo lee la app al tocar la notificación. */
  @Column({ type: 'jsonb', default: {} })
  datos: Record<string, unknown>;

  @Column({ type: 'enum', enum: EstadoNotificacion, default: EstadoNotificacion.PENDIENTE })
  estado: EstadoNotificacion;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  /** Origen: 'pedido', 'chat', 'campania', 'sistema'. */
  @Column({ length: 40, default: 'sistema' })
  origen: string;

  /** Usuario del panel que la disparó, si fue manual. */
  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string | null;
}
