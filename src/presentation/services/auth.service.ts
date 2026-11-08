import { appConfig } from '../../config/appConfig';
import { Cliente } from '../../domain/entities';
import { api } from '../../infrastructure/api/clienteApi';
import { RespuestaAuthApi } from '../../infrastructure/interfaces/api.responses';
import { almacenSeguro } from '../store/almacenSeguro';

const guardarSesion = async (r: RespuestaAuthApi): Promise<Cliente> => {
  await almacenSeguro.guardar('accessToken', r.accessToken);
  await almacenSeguro.guardar('refreshToken', r.refreshToken);
  return { id: r.cliente.sub, nombre: r.cliente.nombre, email: r.cliente.email, viveroId: r.cliente.viveroId };
};

export const authService = {
  async login(email: string, password: string): Promise<Cliente> {
    const { data } = await api.post<RespuestaAuthApi>('/auth/clientes/login', { vivero: appConfig.viveroSlug, email, password });
    return guardarSesion(data);
  },
  async registrar(nombre: string, email: string, password: string): Promise<Cliente> {
    const { data } = await api.post<RespuestaAuthApi>('/auth/clientes/registro', { vivero: appConfig.viveroSlug, nombre, email, password });
    return guardarSesion(data);
  },
  async yo(): Promise<Cliente> {
    const { data } = await api.get('/clientes/yo');
    return { id: data.id, nombre: data.nombre, email: data.email, viveroId: data.viveroId };
  },
  async salir(): Promise<void> {
    await almacenSeguro.borrar('accessToken');
    await almacenSeguro.borrar('refreshToken');
  },
};
