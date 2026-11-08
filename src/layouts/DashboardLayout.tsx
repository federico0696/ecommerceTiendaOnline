import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { useAuth } from '../hooks/useAuth';

export const DashboardLayout = () => {
  const { usuario, esRoot, viveroActualId } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          {esRoot && !viveroActualId && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              Estás como root. Elegí un vivero arriba para ver sus datos, o andá a <b>Viveros (root)</b> para dar de alta uno.
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
