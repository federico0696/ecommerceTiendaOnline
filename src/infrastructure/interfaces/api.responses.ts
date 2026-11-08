/** Formas crudas que devuelve la API. Se convierten a entidades en los mappers. */
export interface PaginadoApi<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

export interface ProductoApi {
  id: string;
  nombre: string;
  slug: string;
  nombreCientifico: string | null;
  tipo: string;
  descripcion: string | null;
  precio: string | number;
  precioOferta: string | number | null;
  stock: number;
  destacado: boolean;
  etiquetas: string[];
  cuidados: Record<string, unknown>;
  imagenes: { url: string; principal: boolean; orden: number }[];
  categoria?: { nombre: string } | null;
}

export interface PedidoApi {
  id: string;
  numero: number;
  estado: string;
  tipoEntrega: string;
  total: string | number;
  creadoEn: string;
  items: { nombreProducto: string; cantidad: number; precioUnitario: string | number }[];
}

export interface RespuestaAuthApi {
  cliente: { sub: string; nombre: string; email: string; viveroId: string };
  accessToken: string;
  refreshToken: string;
}
