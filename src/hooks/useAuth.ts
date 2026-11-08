import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import { cerrarSesion } from '../app/slices/auth.slice';

export const useAuth = () => {
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();
  const esRoot = auth.usuario?.rol === 'root';
  const esAdmin = esRoot || auth.usuario?.rol === 'admin';
  return { ...auth, esRoot, esAdmin, salir: () => dispatch(cerrarSesion()) };
};
