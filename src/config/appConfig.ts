import { API_URL, APP_NOMBRE, SOCKET_URL, VIVERO_SLUG } from '@env';

/** Única puerta a las variables de entorno. Nadie importa '@env' fuera de acá. */
export const appConfig = {
  apiUrl: API_URL ?? 'http://10.0.2.2:3000/api/v1',
  socketUrl: SOCKET_URL ?? 'http://10.0.2.2:3000',
  /** Slug del vivero para el que se compila esta app (marca blanca). */
  viveroSlug: VIVERO_SLUG ?? 'demo',
  nombre: APP_NOMBRE ?? 'Vivero',
};
