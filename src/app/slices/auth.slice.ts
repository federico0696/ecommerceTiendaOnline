import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RespuestaLogin, UsuarioAutenticado } from '../../interfaces';

interface EstadoAuth {
  usuario: UsuarioAutenticado | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** Solo root: vivero sobre el que está operando. */
  viveroActualId: string | null;
}

const CLAVE = 'vivero.panel.sesion';

const cargar = (): EstadoAuth => {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) return JSON.parse(raw);
  } catch { /* sin sesión guardada */ }
  return { usuario: null, accessToken: null, refreshToken: null, viveroActualId: null };
};

const persistir = (estado: EstadoAuth) => localStorage.setItem(CLAVE, JSON.stringify(estado));

const slice = createSlice({
  name: 'auth',
  initialState: cargar(),
  reducers: {
    sesionIniciada(estado, { payload }: PayloadAction<RespuestaLogin>) {
      estado.usuario = payload.usuario;
      estado.accessToken = payload.accessToken;
      estado.refreshToken = payload.refreshToken;
      estado.viveroActualId = payload.usuario.viveroId;
      persistir(estado);
    },
    tokensRenovados(estado, { payload }: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      estado.accessToken = payload.accessToken;
      estado.refreshToken = payload.refreshToken;
      persistir(estado);
    },
    viveroSeleccionado(estado, { payload }: PayloadAction<string | null>) {
      estado.viveroActualId = payload;
      persistir(estado);
    },
    cerrarSesion(estado) {
      estado.usuario = null;
      estado.accessToken = null;
      estado.refreshToken = null;
      estado.viveroActualId = null;
      localStorage.removeItem(CLAVE);
    },
  },
});

export const { sesionIniciada, tokensRenovados, viveroSeleccionado, cerrarSesion } = slice.actions;
export default slice.reducer;
