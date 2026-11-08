import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { EntidadBase } from '../../../common/entities';
import { Producto } from './producto.entity';

@Entity('imagenes_producto')
export class ImagenProducto extends EntidadBase {
  @Index()
  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string;

  @ManyToOne(() => Producto, (p) => p.imagenes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ length: 1024 })
  url: string;

  /** Clave en el storage (S3 o disco) para poder borrarla. */
  @Column({ type: 'varchar', length: 512, nullable: true })
  clave: string | null;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ default: false })
  principal: boolean;
}
