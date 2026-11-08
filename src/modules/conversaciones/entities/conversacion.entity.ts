import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { EntidadVivero } from '../../../common/entities';
import { Canal } from '../../../common/enums';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { MensajeIA } from '../../ia/ia-provider.interface';
import { Mensaje } from './mensaje.entity';

export enum EstadoConversacion {
  ABIERTA = 'abierta',
  CERRADA = 'cerrada',
}

/** Quién está contestando: el bot o una persona del vivero. */
export enum ModoConversacion {
  BOT = 'bot',
  HUMANO = 'humano',
}

/**
 * Una conversación por cliente, canal y vivero. Es la misma entidad para app, web y WhatsApp:
 * lo único que cambia es `canal` y cómo se entrega la respuesta.
 *
 * `mensajes` es lo que ven las personas (cliente y panel).
 * `historialIa` es el contexto en formato neutro que se le pasa al proveedor de IA
 * (incluye llamadas a herramientas que las personas no ven). Se recorta a N ítems.
 */
@Entity('conversaciones')
@Index(['viveroId', 'estado'])
export class Conversacion extends EntidadVivero {
  @Index()
  @Column({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cliente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'enum', enum: Canal, default: Canal.APP })
  canal: Canal;

  @Column({ type: 'enum', enum: EstadoConversacion, default: EstadoConversacion.ABIERTA })
  estado: EstadoConversacion;

  @Column({ type: 'enum', enum: ModoConversacion, default: ModoConversacion.BOT })
  modo: ModoConversacion;

  /** Empleado que la tomó, si está en modo humano. */
  @Column({ name: 'asignado_a_id', type: 'uuid', nullable: true })
  asignadoAId: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'asignado_a_id' })
  asignadoA: Usuario | null;

  /** Por qué se derivó a humano (lo pidió el cliente, el bot no supo, etc.). */
  @Column({ type: 'text', nullable: true })
  motivoDerivacion: string | null;

  @Column({ type: 'jsonb', default: [] })
  historialIa: MensajeIA[];

  /** Resumen generado por IA para que el empleado que toma el chat se ponga al día. */
  @Column({ type: 'text', nullable: true })
  resumenIa: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  ultimoMensajeEn: Date | null;

  @Column({ type: 'text', nullable: true })
  ultimoMensajeTexto: string | null;

  @Column({ type: 'int', default: 0 })
  noLeidosPanel: number;

  @Column({ type: 'int', default: 0 })
  noLeidosCliente: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @OneToMany(() => Mensaje, (m) => m.conversacion)
  mensajes: Mensaje[];
}
