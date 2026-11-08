import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Rol } from '../interfaces';

export const SoloRol = ({ roles, children }: { roles: Rol[]; children: ReactNode }) => {
  const { usuario } = useAuth();
  if (!usuario || !roles.includes(usuario.rol)) return <Navigate to="/" replace />;
  return <>{children}</>;
};
