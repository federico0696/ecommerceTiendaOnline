import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { EntidadVivero } from '../../../common/entities';
import { Vivero } from '../../viveros/entities/vivero.entity';
import { Producto } from './producto.entity';

/** Categorías del catálogo: Plantas de interior, Suculentas, Macetas, Tierra y sustratos, etc. */
@Entity('categorias')
@Index(['viveroId', 'slug'], { unique: true })
export class Categoria extends EntidadVivero {
  @ManyToOne(() => Vivero, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vivero_id' })
  vivero: Vivero;

  @Column({ length: 80 })
  nombre: string;

  @Column({ length: 80 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  imagenUrl: string | null;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ default: true })
  activa: boolean;

  @OneToMany(() => Producto, (p) => p.categoria)
  productos: Producto[];
}
