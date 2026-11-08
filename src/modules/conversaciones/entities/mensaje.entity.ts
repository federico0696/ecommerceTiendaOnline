import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { EntidadVivero } from '../../../common/entities';
import { Conversacion } from './conversacion.entity';

export enum EmisorMensaje {
  CLIENTE = 'cliente',
  BOT = 'bot',
  EMPLEADO = 'empleado',
  SISTEMA = 'sistema',
}

export enum TipoMensaje {
  TEXTO = 'texto',
  IMAGEN = 'imagen',
  ARCHIVO = 'archivo',
  BOTONES = 'botones',
  PRODUCTO = 'producto',
}

@Entity('mensajes')
@Index(['conversacionId', 'creadoEn'])
export class Mensaje extends EntidadVivero {
  @Column({ name: 'conversacion_id', type: 'uuid' })
  conversacionId: string;

  @ManyToOne(() => Conversacion, (c) => c.mensajes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversacion_id' })
  conversacion: Conversacion;

  @Column({ type: 'enum', enum: EmisorMensaje })
  emisor: EmisorMensaje;

  /** id del cliente o del usuario del panel que lo escribió. null para bot y sistema. */
  @Column({ name: 'emisor_id', type: 'uuid', nullable: true })
  emisorId: string | null;

  @Column({ type: 'enum', enum: TipoMensaje, default: TipoMensaje.TEXTO })
  tipo: TipoMensaje;

  @Column({ type: 'text' })
  contenido: string;

  /** Adjuntos, botones, producto referenciado, id del mensaje en WhatsApp, etc. */
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @Column({ default: false })
  leido: boolean;
}
