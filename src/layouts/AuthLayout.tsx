import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AuthLayout = () => {
  const { usuario } = useAuth();
  if (usuario) return <Navigate to="/" replace />;
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-verde-700 to-verde-500 p-4">
      <Outlet />
    </div>
  );
};
