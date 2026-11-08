import { create } from 'zustand';
import { Vivero } from '../../domain/entities';
import { viveroService } from '../services/vivero.service';

/** Perfil público del vivero: marca, horarios, entregas. Se carga antes del login. */
interface ViveroState {
  vivero: Vivero | null;
  error: string | null;
  cargar: () => Promise<void>;
}

export const useViveroStore = create<ViveroState>()((set) => ({
  vivero: null,
  error: null,
  cargar: async () => {
    try {
      set({ vivero: await viveroService.perfilPublico(), error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
