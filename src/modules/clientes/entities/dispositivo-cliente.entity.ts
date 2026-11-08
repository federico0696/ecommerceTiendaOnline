import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { EntidadBase } from '../../../common/entities';
import { Cliente } from './cliente.entity';

/** Token de Firebase Cloud Messaging por dispositivo. Un cliente puede tener varios. */
@Entity('dispositivos_cliente')
export class DispositivoCliente extends EntidadBase {
  @Index()
  @Column({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cliente, (c) => c.dispositivos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Index({ unique: true })
  @Column({ length: 512 })
  tokenFcm: string;

  @Column({ type: 'varchar', length: 20, default: 'android' })
  plataforma: 'android' | 'ios';

  @Column({ type: 'varchar', length: 120, nullable: true })
  modelo: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  versionApp: string | null;

  @Column({ default: true })
  activo: boolean;
}
