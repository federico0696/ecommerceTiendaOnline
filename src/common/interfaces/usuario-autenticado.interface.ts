import { Rol } from '../enums';

/** Payload que viaja en el JWT y queda en request.user. */
export interface UsuarioAutenticado {
  /** id del usuario (panel) o del cliente (app) */
  sub: string;
  /** de qué tabla sale: usuarios del panel o clientes de la app */
  tipo: 'usuario' | 'cliente';
  rol: Rol;
  /** null solo para ROOT */
  viveroId: string | null;
  email: string;
  nombre: string;
}
