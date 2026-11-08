import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../app/store';
import { cerrarSesion, tokensRenovados } from '../app/slices/auth.slice';

/**
 * Cliente HTTP único. Agrega el token, el header x-vivero-id (para root)
 * y renueva el access token automáticamente cuando vence.
 */
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const { auth } = store.getState();
  if (auth.accessToken) config.headers.Authorization = `Bearer ${auth.accessToken}`;
  if (auth.usuario?.rol === 'root' && auth.viveroActualId) config.headers['x-vivero-id'] = auth.viveroActualId;
  return config;
});

let renovando: Promise<string> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError<{ mensaje?: string | string[] }>) => {
    const original = error.config as InternalAxiosRequestConfig & { _reintentado?: boolean };
    const { auth } = store.getState();
    if (error.response?.status === 401 && auth.refreshToken && !original._reintentado && !original.url?.includes('/auth/')) {
      original._reintentado = true;
      try {
        renovando ??= axios
          .post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken: auth.refreshToken })
          .then((r) => {
            store.dispatch(tokensRenovados(r.data));
            return r.data.accessToken as string;
          })
          .finally(() => (renovando = null));
        const token = await renovando;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        store.dispatch(cerrarSesion());
      }
    }
    return Promise.reject(error);
  },
);

/** Mensaje legible de un error de la API (soporta la lista de class-validator). */
export const mensajeError = (e: unknown): string => {
  const err = e as AxiosError<{ mensaje?: string | string[] }>;
  const m = err.response?.data?.mensaje;
  if (Array.isArray(m)) return m.join('. ');
  return m ?? err.message ?? 'Error inesperado';
};
