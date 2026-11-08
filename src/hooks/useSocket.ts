import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

/**
 * Conexión Socket.IO al namespace /rt de la API. Se crea una por pantalla que la necesite
 * y se cierra al desmontar. `handlers` mapea nombre de evento -> función.
 */
export const useSocket = (// eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlers: Record<string, (payload: any) => void>, activo = true) => {
  const { accessToken, viveroActualId } = useAuth();
  const ref = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!activo || !accessToken) return;
    const socket = io(`${import.meta.env.VITE_SOCKET_URL}/rt`, { auth: { token: accessToken, viveroId: viveroActualId }, transports: ['websocket'] });
    ref.current = socket;
    const nombres = Object.keys(handlersRef.current);
    for (const n of nombres) socket.on(n, (p) => handlersRef.current[n]?.(p));
    return () => {
      socket.disconnect();
      ref.current = null;
    };
  }, [accessToken, viveroActualId, activo]);

  return ref;
};
