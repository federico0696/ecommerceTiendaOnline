import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { EntidadBase } from '../../../common/entities';
import { Rol } from '../../../common/enums';
import { Vivero } from '../../viveros/entities/vivero.entity';

/**
 * Usuarios del PANEL: root, admins y empleados.
 * Los clientes de la app están en otra tabla (clientes) porque su ciclo de vida,
 * sus datos y su autenticación son distintos.
 */
@Entity('usuarios')
export class Usuario extends EntidadBase {
  @Index({ unique: true })
  @Column({ length: 160 })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ length: 120 })
  nombre: string;

  @Column({ type: 'enum', enum: Rol, default: Rol.EMPLEADO })
  rol: Rol;

  /** null solo para root */
  @Index()
  @Column({ name: 'vivero_id', type: 'uuid', nullable: true })
  viveroId: string | null;

  @ManyToOne(() => Vivero, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vivero_id' })
  vivero: Vivero | null;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'varchar', length: 40, nullable: true })
  telefono: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  ultimoAcceso: Date | null;

  /** Para invalidar refresh tokens al cambiar contraseña o desactivar. */
  @Column({ type: 'int', default: 0 })
  versionToken: number;
}
