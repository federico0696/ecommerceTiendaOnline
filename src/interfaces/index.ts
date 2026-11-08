/** Tipos compartidos con la API. Se mantienen a mano y chicos: solo lo que el panel usa. */
export type Rol = 'root' | 'admin' | 'empleado' | 'cliente';

export interface UsuarioAutenticado {
  sub: string;
  tipo: 'usuario' | 'cliente';
  rol: Rol;
  viveroId: string | null;
  email: string;
  nombre: string;
}

export interface RespuestaLogin {
  usuario: UsuarioAutenticado;
  accessToken: string;
  refreshToken: string;
  expiraEn: string;
}

export interface Paginado<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

export interface Vivero {
  id: string;
  nombre: string;
  slug: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  provincia: string | null;
  activo: boolean;
  configuracion: {
    marca: { colorPrimario: string; colorSecundario: string; logoUrl: string | null };
    horarios: string;
    ia: { proveedor: 'mock' | 'openai' | 'anthropic' | null; nombreBot: string; instruccionesExtra: string };
    canales: { appHabilitada: boolean; webHabilitada: boolean; whatsappHabilitado: boolean; whatsappPhoneNumberId: string | null };
    pedidos: { permiteEnvio: boolean; permiteRetiro: boolean; costoEnvioBase: number };
  };
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  viveroId: string | null;
  activo: boolean;
  ultimoAcceso: string | null;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  activa: boolean;
  orden: number;
}

export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  nombreCientifico: string | null;
  tipo: string;
  categoriaId: string | null;
  categoria?: Categoria | null;
  descripcion: string | null;
  precio: number;
  precioOferta: number | null;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  destacado: boolean;
  etiquetas: string[];
  cuidados: Record<string, unknown>;
  imagenes: { id: string; url: string; principal: boolean }[];
}

export type EstadoPedido = 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'en_camino' | 'entregado' | 'cancelado';

export interface Pedido {
  id: string;
  numero: number;
  estado: EstadoPedido;
  tipoEntrega: 'retiro' | 'envio';
  estadoPago: 'pendiente' | 'pagado' | 'reembolsado';
  total: number;
  creadoEn: string;
  cliente?: { id: string; nombre: string; email: string };
  items: { id: string; nombreProducto: string; cantidad: number; precioUnitario: number; subtotal: number }[];
  historialEstados: { estado: EstadoPedido; fecha: string; motivo?: string }[];
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  whatsapp: string | null;
  activo: boolean;
  creadoEn: string;
  ultimoAcceso: string | null;
}

export type Canal = 'app' | 'web' | 'whatsapp';

export interface Conversacion {
  id: string;
  canal: Canal;
  estado: 'abierta' | 'cerrada';
  modo: 'bot' | 'humano';
  asignadoAId: string | null;
  asignadoA?: { id: string; nombre: string } | null;
  motivoDerivacion: string | null;
  resumenIa: string | null;
  ultimoMensajeEn: string | null;
  ultimoMensajeTexto: string | null;
  noLeidosPanel: number;
  cliente: { id: string; nombre: string; email: string; whatsapp: string | null };
}

export interface Mensaje {
  id: string;
  conversacionId: string;
  emisor: 'cliente' | 'bot' | 'empleado' | 'sistema';
  tipo: string;
  contenido: string;
  creadoEn: string;
  metadata: Record<string, unknown>;
}

export interface Notificacion {
  id: string;
  canal: 'push' | 'whatsapp' | 'email';
  titulo: string;
  cuerpo: string;
  estado: 'pendiente' | 'enviada' | 'fallida' | 'simulada';
  origen: string;
  creadoEn: string;
}
