import { Mensaje } from '../../domain/entities';
import { api } from '../../infrastructure/api/clienteApi';
import { PaginadoApi } from '../../infrastructure/interfaces/api.responses';

export interface RespuestaEnvio {
  conversacionId: string;
  modo: 'bot' | 'humano';
  mensaje: Mensaje;
  respuesta: Mensaje | null;
}

export const chatService = {
  async conversacion(): Promise<{ id: string; modo: 'bot' | 'humano' }> {
    const { data } = await api.get('/chat/conversacion');
    return { id: data.id, modo: data.modo };
  },
  async mensajes(conversacionId: string): Promise<Mensaje[]> {
    const { data } = await api.get<PaginadoApi<Mensaje>>(`/chat/conversaciones/${conversacionId}/mensajes`, { params: { limite: 100 } });
    return data.datos;
  },
  async enviar(texto: string): Promise<RespuestaEnvio> {
    const { data } = await api.post<RespuestaEnvio>('/chat/mensajes', { texto });
    return data;
  },
};
