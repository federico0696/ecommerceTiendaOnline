import { Platform } from 'react-native';
import { api } from '../../infrastructure/api/clienteApi';

/**
 * Push con Firebase Cloud Messaging.
 * El módulo de Firebase se carga de forma perezosa: si la app se compila sin
 * google-services.json real, no rompe el arranque; solo no registra el token.
 */
export const notificacionesService = {
  async registrarDispositivo(): Promise<void> {
    try {
      const messaging = (await import('@react-native-firebase/messaging')).default;
      const permiso = await messaging().requestPermission();
      if (permiso === messaging.AuthorizationStatus.DENIED) return;
      const tokenFcm = await messaging().getToken();
      if (!tokenFcm) return;
      await api.post('/clientes/yo/dispositivos', { tokenFcm, plataforma: Platform.OS === 'ios' ? 'ios' : 'android' });
    } catch (e) {
      console.log('[push] No se pudo registrar el dispositivo:', (e as Error).message);
    }
  },

  /** Devuelve una función para desuscribirse. */
  async escucharEnPrimerPlano(alRecibir: (titulo: string, cuerpo: string, datos: Record<string, string>) => void): Promise<() => void> {
    try {
      const messaging = (await import('@react-native-firebase/messaging')).default;
      return messaging().onMessage(async (m) => {
        alRecibir(m.notification?.title ?? '', m.notification?.body ?? '', (m.data as Record<string, string>) ?? {});
      });
    } catch {
      return () => undefined;
    }
  },
};
