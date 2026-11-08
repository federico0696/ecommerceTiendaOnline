/** Entidades tal como las usa la app (ya mapeadas desde la API). */
export interface Vivero {
  id: string;
  nombre: string;
  slug: string;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  marca: { colorPrimario: string; colorSecundario: string; logoUrl: string | null };
  horarios: string;
  nombreBot: string;
  pedidos: { permiteEnvio: boolean; permiteRetiro: boolean; costoEnvioBase: number };
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  viveroId: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
}

export interface FichaCuidado {
  luz: string | null;
  riego: string | null;
  riegoDetalle: string | null;
  ubicacion: string | null;
  dificultad: string | null;
  toxicaMascotas: boolean | null;
  consejos: string | null;
}

export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  nombreCientifico: string | null;
  tipo: string;
  descripcion: string | null;
  precio: number;
  precioOferta: number | null;
  stock: number;
  destacado: boolean;
  etiquetas: string[];
  cuidados: FichaCuidado;
  imagen: string | null;
  imagenes: string[];
  categoria: string | null;
}

export type EstadoPedido = 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'en_camino' | 'entregado' | 'cancelado';

export interface Pedido {
  id: string;
  numero: number;
  estado: EstadoPedido;
  tipoEntrega: 'retiro' | 'envio';
  total: number;
  creadoEn: string;
  items: { nombreProducto: string; cantidad: number; precioUnitario: number }[];
}

export interface Mensaje {
  id: string;
  emisor: 'cliente' | 'bot' | 'empleado' | 'sistema';
  contenido: string;
  creadoEn: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}
