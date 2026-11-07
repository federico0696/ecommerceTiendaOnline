import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { EntidadVivero } from '../../../common/entities';
import { Producto } from './producto.entity';

export enum MotivoMovimiento {
  COMPRA = 'compra',
  VENTA = 'venta',
  AJUSTE = 'ajuste',
  MERMA = 'merma',
  DEVOLUCION = 'devolucion',
}

/** Cada cambio de stock queda registrado: quién, cuánto, por qué. */
@Entity('movimientos_stock')
export class MovimientoStock extends EntidadVivero {
  @Index()
  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string;

  @ManyToOne(() => Producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  /** Positivo suma, negativo resta. */
  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'int' })
  stockResultante: number;

  @Column({ type: 'enum', enum: MotivoMovimiento })
  motivo: MotivoMovimiento;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  /** id del usuario del panel que lo hizo; null si lo generó el sistema (una venta por la app). */
  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string | null;

  @Column({ name: 'pedido_id', type: 'uuid', nullable: true })
  pedidoId: string | null;
}
