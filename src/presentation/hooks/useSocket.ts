import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { appConfig } from '../../config/appConfig';
import { almacenSeguro } from '../store/almacenSeguro';

/** Socket al namespace /rt de la API. El cliente queda en su sala `cliente:{id}` automáticamente. */
export const useSocket = (handlers: Record<string, (payload: any) => void>, activo = true) => {
  useEffect(() => {
    if (!activo) return;
    let cerrado = false;
    let socket: ReturnType<typeof io> | null = null;
    almacenSeguro.leer('accessToken').then((token) => {
      if (cerrado || !token) return;
      socket = io(`${appConfig.socketUrl}/rt`, { auth: { token }, transports: ['websocket'] });
      for (const [evento, fn] of Object.entries(handlers)) socket.on(evento, fn);
    });
    return () => {
      cerrado = true;
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo]);
};
