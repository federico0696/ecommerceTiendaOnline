import { appConfig } from '../../config/appConfig';
import { Vivero } from '../../domain/entities';
import { api } from '../../infrastructure/api/clienteApi';

export const viveroService = {
  async perfilPublico(): Promise<Vivero> {
    const { data } = await api.get(`/viveros/publico/${appConfig.viveroSlug}`);
    return data as Vivero;
  },
};
