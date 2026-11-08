import { appConfig } from '../../config/appConfig';
import { Categoria, Producto } from '../../domain/entities';
import { api } from '../../infrastructure/api/clienteApi';
import { PaginadoApi, ProductoApi } from '../../infrastructure/interfaces/api.responses';
import { mapearProducto } from '../../infrastructure/mappers/producto.mapper';

const base = `/publico/${appConfig.viveroSlug}/catalogo`;

export const catalogoService = {
  async categorias(): Promise<Categoria[]> {
    const { data } = await api.get<Categoria[]>(`${base}/categorias`);
    return data;
  },
  async productos(filtros: { buscar?: string; categoriaId?: string; destacados?: boolean; pagina?: number } = {}): Promise<{ productos: Producto[]; paginas: number }> {
    const { data } = await api.get<PaginadoApi<ProductoApi>>(`${base}/productos`, { params: { limite: 20, ...filtros } });
    return { productos: data.datos.map(mapearProducto), paginas: data.paginas };
  },
  async producto(slug: string): Promise<Producto> {
    const { data } = await api.get<ProductoApi>(`${base}/productos/${slug}`);
    return mapearProducto(data);
  },
};
