import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { EntidadBase } from '../../../common/entities';
import { Producto } from '../../catalogo/entities/producto.entity';
import { Pedido } from './pedido.entity';

/** Snapshot del producto al momento de la compra: si después cambia el precio, el pedido no se altera. */
@Entity('items_pedido')
export class ItemPedido extends EntidadBase {
  @Index()
  @Column({ name: 'pedido_id', type: 'uuid' })
  pedidoId: string;

  @ManyToOne(() => Pedido, (p) => p.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string;

  @ManyToOne(() => Producto, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ length: 160 })
  nombreProducto: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;
}
