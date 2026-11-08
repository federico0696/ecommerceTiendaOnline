import { ItemCarrito, Pedido } from '../../domain/entities';
import { api } from '../../infrastructure/api/clienteApi';
import { PaginadoApi, PedidoApi } from '../../infrastructure/interfaces/api.responses';
import { mapearPedido } from '../../infrastructure/mappers/producto.mapper';

export const pedidosService = {
  async crear(items: ItemCarrito[], tipoEntrega: 'retiro' | 'envio', direccionEntrega?: string, notaCliente?: string): Promise<Pedido> {
    const { data } = await api.post<PedidoApi>('/mis-pedidos', {
      items: items.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
      tipoEntrega,
      direccionEntrega,
      notaCliente,
    });
    return mapearPedido(data);
  },
  async listar(): Promise<Pedido[]> {
    const { data } = await api.get<PaginadoApi<PedidoApi>>('/mis-pedidos', { params: { limite: 50 } });
    return data.datos.map(mapearPedido);
  },
  async cancelar(id: string): Promise<Pedido> {
    const { data } = await api.patch<PedidoApi>(`/mis-pedidos/${id}/cancelar`);
    return mapearPedido(data);
  },
};
