import { api } from './cliente';
import type {
  Categoria, Cliente, Conversacion, Mensaje, Notificacion, Paginado, Pedido, Producto, RespuestaLogin, Usuario, Vivero,
} from '../interfaces';

/** La configuración se mergea en la API: se puede mandar solo la parte que cambia. */
type ConfiguracionParcial = { [K in keyof Vivero['configuracion']]?: Partial<Vivero['configuracion'][K]> };
export type ActualizacionVivero = Omit<Partial<Vivero>, 'configuracion'> & { configuracion?: ConfiguracionParcial };

/** Funciones de acceso a la API agrupadas por recurso. Las páginas no usan axios directo. */
export const authApi = {
  login: (email: string, password: string) => api.post<RespuestaLogin>('/auth/login', { email, password }).then((r) => r.data),
};

export const viverosApi = {
  listar: (buscar = '') => api.get<Paginado<Vivero>>('/viveros', { params: { buscar, limite: 100 } }).then((r) => r.data),
  mio: () => api.get<Vivero>('/viveros/mio').then((r) => r.data),
  obtener: (id: string) => api.get<Vivero>(`/viveros/${id}`).then((r) => r.data),
  crear: (datos: Partial<Vivero>) => api.post<Vivero>('/viveros', datos).then((r) => r.data),
  actualizar: (id: string, datos: ActualizacionVivero) => api.patch<Vivero>(`/viveros/${id}`, datos).then((r) => r.data),
};

export const usuariosApi = {
  listar: (viveroId?: string) => api.get<Paginado<Usuario>>('/usuarios', { params: { limite: 100, viveroId } }).then((r) => r.data),
  crear: (datos: { email: string; password: string; nombre: string; rol: 'admin' | 'empleado'; viveroId?: string }) =>
    api.post<Usuario>('/usuarios', datos).then((r) => r.data),
  actualizar: (id: string, datos: Partial<Usuario>) => api.patch<Usuario>(`/usuarios/${id}`, datos).then((r) => r.data),
};

export const catalogoApi = {
  categorias: () => api.get<Categoria[]>('/catalogo/categorias').then((r) => r.data),
  crearCategoria: (nombre: string) => api.post<Categoria>('/catalogo/categorias', { nombre }).then((r) => r.data),
  productos: (params: Record<string, unknown> = {}) => api.get<Paginado<Producto>>('/catalogo/productos', { params }).then((r) => r.data),
  stockBajo: () => api.get<Producto[]>('/catalogo/productos/stock-bajo').then((r) => r.data),
  crearProducto: (datos: Record<string, unknown>) => api.post<Producto>('/catalogo/productos', datos).then((r) => r.data),
  actualizarProducto: (id: string, datos: Record<string, unknown>) => api.patch<Producto>(`/catalogo/productos/${id}`, datos).then((r) => r.data),
  ajustarStock: (id: string, cantidad: number, motivo: string, observacion?: string) =>
    api.post(`/catalogo/productos/${id}/stock`, { cantidad, motivo, observacion }).then((r) => r.data),
};

export const pedidosApi = {
  listar: (params: Record<string, unknown> = {}) => api.get<Paginado<Pedido>>('/pedidos', { params }).then((r) => r.data),
  resumen: () => api.get<{ porEstado: Record<string, number> }>('/pedidos/resumen').then((r) => r.data),
  cambiarEstado: (id: string, estado: string, motivo?: string) => api.patch<Pedido>(`/pedidos/${id}/estado`, { estado, motivo }).then((r) => r.data),
};

export const clientesApi = {
  listar: (buscar = '') => api.get<Paginado<Cliente>>('/clientes', { params: { buscar, limite: 50 } }).then((r) => r.data),
};

export const conversacionesApi = {
  listar: (params: Record<string, unknown> = {}) => api.get<Paginado<Conversacion>>('/conversaciones', { params: { limite: 50, ...params } }).then((r) => r.data),
  resumen: () => api.get<{ abiertas: number; enHumano: number; sinAsignar: number; noLeidos: number }>('/conversaciones/resumen').then((r) => r.data),
  obtener: (id: string) => api.get<Conversacion>(`/conversaciones/${id}`).then((r) => r.data),
  mensajes: (id: string) => api.get<Paginado<Mensaje>>(`/conversaciones/${id}/mensajes`, { params: { limite: 100 } }).then((r) => r.data),
  responder: (id: string, contenido: string) => api.post<Mensaje>(`/conversaciones/${id}/mensajes`, { contenido }).then((r) => r.data),
  asignarme: (id: string) => api.patch<Conversacion>(`/conversaciones/${id}/asignar`, {}).then((r) => r.data),
  devolverAlBot: (id: string) => api.patch<Conversacion>(`/conversaciones/${id}/devolver-al-bot`).then((r) => r.data),
  cerrar: (id: string) => api.patch<Conversacion>(`/conversaciones/${id}/cerrar`).then((r) => r.data),
};

export const botApi = {
  herramientas: () => api.get<{ nombre: string; descripcion: string }[]>('/bot/herramientas').then((r) => r.data),
  proveedores: () => api.get<{ disponibles: string[] }>('/bot/proveedores').then((r) => r.data),
  probar: (mensaje: string) =>
    api.post<{ texto: string; derivado: boolean; proveedor: string; modelo: string; herramientasUsadas: string[] }>('/bot/probar', { mensaje }).then((r) => r.data),
};

export const notificacionesApi = {
  enviar: (datos: { canal: string; titulo: string; cuerpo: string; clienteIds?: string[] }) => api.post('/notificaciones/enviar', datos).then((r) => r.data),
  historial: () => api.get<Paginado<Notificacion>>('/notificaciones', { params: { limite: 50 } }).then((r) => r.data),
};
