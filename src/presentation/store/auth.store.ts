import { create } from 'zustand';
import { Cliente } from '../../domain/entities';
import { authService } from '../services/auth.service';
import { almacenSeguro } from './almacenSeguro';

type EstadoSesion = 'verificando' | 'autenticado' | 'anonimo';

interface AuthState {
  estado: EstadoSesion;
  cliente: Cliente | null;
  verificar: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  registrar: (nombre: string, email: string, password: string) => Promise<void>;
  salir: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  estado: 'verificando',
  cliente: null,

  verificar: async () => {
    const token = await almacenSeguro.leer('accessToken');
    if (!token) return set({ estado: 'anonimo', cliente: null });
    try {
      const cliente = await authService.yo();
      set({ estado: 'autenticado', cliente });
    } catch {
      set({ estado: 'anonimo', cliente: null });
    }
  },

  login: async (email, password) => {
    const cliente = await authService.login(email, password);
    set({ estado: 'autenticado', cliente });
  },

  registrar: async (nombre, email, password) => {
    const cliente = await authService.registrar(nombre, email, password);
    set({ estado: 'autenticado', cliente });
  },

  salir: async () => {
    await authService.salir();
    set({ estado: 'anonimo', cliente: null });
  },
}));
