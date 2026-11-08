import { Pedido, Producto } from '../../domain/entities';
import { PedidoApi, ProductoApi } from '../interfaces/api.responses';

export const mapearProducto = (p: ProductoApi): Producto => {
  const ordenadas = [...(p.imagenes ?? [])].sort((a, b) => Number(b.principal) - Number(a.principal) || a.orden - b.orden);
  return {
    id: p.id,
    nombre: p.nombre,
    slug: p.slug,
    nombreCientifico: p.nombreCientifico,
    tipo: p.tipo,
    descripcion: p.descripcion,
    precio: Number(p.precio),
    precioOferta: p.precioOferta == null ? null : Number(p.precioOferta),
    stock: p.stock,
    destacado: p.destacado,
    etiquetas: p.etiquetas ?? [],
    cuidados: {
      luz: (p.cuidados?.luz as string) ?? null,
      riego: (p.cuidados?.riego as string) ?? null,
      riegoDetalle: (p.cuidados?.riegoDetalle as string) ?? null,
      ubicacion: (p.cuidados?.ubicacion as string) ?? null,
      dificultad: (p.cuidados?.dificultad as string) ?? null,
      toxicaMascotas: (p.cuidados?.toxicaMascotas as boolean) ?? null,
      consejos: (p.cuidados?.consejos as string) ?? null,
    },
    imagen: ordenadas[0]?.url ?? null,
    imagenes: ordenadas.map((i) => i.url),
    categoria: p.categoria?.nombre ?? null,
  };
};

export const mapearPedido = (p: PedidoApi): Pedido => ({
  id: p.id,
  numero: p.numero,
  estado: p.estado as Pedido['estado'],
  tipoEntrega: p.tipoEntrega as Pedido['tipoEntrega'],
  total: Number(p.total),
  creadoEn: p.creadoEn,
  items: p.items.map((i) => ({ nombreProducto: i.nombreProducto, cantidad: i.cantidad, precioUnitario: Number(i.precioUnitario) })),
});
