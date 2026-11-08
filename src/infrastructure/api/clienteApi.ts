import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { appConfig } from '../../config/appConfig';
import { almacenSeguro } from '../../presentation/store/almacenSeguro';

/**
 * Cliente HTTP de la app. Agrega el token y renueva el access token cuando vence.
 * Si el refresh falla, avisa por `alCerrarSesion` para que el store limpie la sesión.
 */
export const api = axios.create({ baseURL: appConfig.apiUrl, timeout: 20000 });

let alCerrarSesion: (() => void) | null = null;
export const registrarCierreSesion = (cb: () => void) => { alCerrarSesion = cb; };

api.interceptors.request.use(async (config) => {
  const token = await almacenSeguro.leer('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let renovando: Promise<string> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _reintentado?: boolean };
    if (error.response?.status !== 401 || original._reintentado || original.url?.includes('/auth/')) throw error;
    original._reintentado = true;
    const refreshToken = await almacenSeguro.leer('refreshToken');
    if (!refreshToken) throw error;
    try {
      renovando ??= axios
        .post(`${appConfig.apiUrl}/auth/refresh`, { refreshToken })
        .then(async (r) => {
          await almacenSeguro.guardar('accessToken', r.data.accessToken);
          await almacenSeguro.guardar('refreshToken', r.data.refreshToken);
          return r.data.accessToken as string;
        })
        .finally(() => { renovando = null; });
      const token = await renovando;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (e) {
      alCerrarSesion?.();
      throw e;
    }
  },
);

export const mensajeError = (e: unknown): string => {
  const err = e as AxiosError<{ mensaje?: string | string[] }>;
  const m = err.response?.data?.mensaje;
  if (Array.isArray(m)) return m.join('. ');
  if (m) return m;
  if (err.code === 'ECONNABORTED' || err.message?.includes('Network')) return 'No hay conexión con el vivero. Revisá tu internet.';
  return err.message ?? 'Error inesperado';
};
