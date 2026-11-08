import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { EntidadVivero } from '../../../common/entities';
import { Vivero } from '../../viveros/entities/vivero.entity';
import { DispositivoCliente } from './dispositivo-cliente.entity';

/**
 * Cliente de un vivero: el usuario de la app mobile.
 * El email es único POR VIVERO (una misma persona puede ser cliente de dos viveros).
 */
@Entity('clientes')
@Index(['viveroId', 'email'], { unique: true })
export class Cliente extends EntidadVivero {
  @ManyToOne(() => Vivero, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vivero_id' })
  vivero: Vivero;

  @Column({ length: 160 })
  email: string;

  @Column({ type: 'varchar', select: false, nullable: true })
  passwordHash: string | null;

  @Column({ length: 120 })
  nombre: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  telefono: string | null;

  /** Número de WhatsApp normalizado (solo dígitos con código de país). Vincula el canal WhatsApp con el cliente. */
  @Index()
  @Column({ type: 'varchar', length: 30, nullable: true })
  whatsapp: string | null;

  @Column({ type: 'text', nullable: true })
  direccion: string | null;

  @Column({ default: true })
  activo: boolean;

  @Column({ default: true })
  aceptaNotificaciones: boolean;

  /** Datos que el bot y el recomendador usan para personalizar (luz, balcón, mascotas, experiencia). */
  @Column({ type: 'jsonb', default: {} })
  perfilJardin: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  ultimoAcceso: Date | null;

  @Column({ type: 'int', default: 0 })
  versionToken: number;

  @OneToMany(() => DispositivoCliente, (d) => d.cliente)
  dispositivos: DispositivoCliente[];
}
