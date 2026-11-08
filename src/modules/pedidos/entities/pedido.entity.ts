import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { EntidadVivero } from '../../../common/entities';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { ItemPedido } from './item-pedido.entity';

export enum EstadoPedido {
  PENDIENTE = 'pendiente', // lo hizo el cliente, el vivero todavía no lo vio
  CONFIRMADO = 'confirmado', // el vivero lo aceptó
  PREPARANDO = 'preparando',
  LISTO = 'listo', // listo para retirar o salir
  EN_CAMINO = 'en_camino',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
}

export enum TipoEntrega {
  RETIRO = 'retiro',
  ENVIO = 'envio',
}

export enum EstadoPago {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado',
  REEMBOLSADO = 'reembolsado',
}

/** Transiciones de estado permitidas. Lo demás es error. */
export const TRANSICIONES_PEDIDO: Record<EstadoPedido, EstadoPedido[]> = {
  [EstadoPedido.PENDIENTE]: [EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO],
  [EstadoPedido.CONFIRMADO]: [EstadoPedido.PREPARANDO, EstadoPedido.CANCELADO],
  [EstadoPedido.PREPARANDO]: [EstadoPedido.LISTO, EstadoPedido.CANCELADO],
  [EstadoPedido.LISTO]: [EstadoPedido.EN_CAMINO, EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO],
  [EstadoPedido.EN_CAMINO]: [EstadoPedido.ENTREGADO],
  [EstadoPedido.ENTREGADO]: [],
  [EstadoPedido.CANCELADO]: [],
};

@Entity('pedidos')
export class Pedido extends EntidadVivero {
  /** Número corto y legible por vivero (#1042). */
  @Index()
  @Column({ type: 'int' })
  numero: number;

  @Index()
  @Column({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cliente, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'enum', enum: EstadoPedido, default: EstadoPedido.PENDIENTE })
  estado: EstadoPedido;

  @Column({ type: 'enum', enum: TipoEntrega, default: TipoEntrega.RETIRO })
  tipoEntrega: TipoEntrega;

  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDIENTE })
  estadoPago: EstadoPago;

  @Column({ type: 'text', nullable: true })
  direccionEntrega: string | null;

  @Column({ type: 'text', nullable: true })
  notaCliente: string | null;

  @Column({ type: 'text', nullable: true })
  notaInterna: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  costoEnvio: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  /** Para cuando entre Mercado Pago u otro: id externo del pago. */
  @Column({ type: 'varchar', length: 120, nullable: true })
  referenciaPago: string | null;

  /** Historial de cambios de estado: [{estado, fecha, usuarioId}]. */
  @Column({ type: 'jsonb', default: [] })
  historialEstados: {
    estado: EstadoPedido;
    fecha: string;
    usuarioId: string | null;
    motivo?: string;
  }[];

  @OneToMany(() => ItemPedido, (i) => i.pedido, { cascade: true, eager: true })
  items: ItemPedido[];
}
