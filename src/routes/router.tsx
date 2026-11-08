import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { InicioPage } from '../pages/inicio/InicioPage';
import { ChatsPage } from '../pages/chats/ChatsPage';
import { PedidosPage } from '../pages/pedidos/PedidosPage';
import { CatalogoPage } from '../pages/catalogo/CatalogoPage';
import { ClientesPage } from '../pages/clientes/ClientesPage';
import { CampaniasPage } from '../pages/campanias/CampaniasPage';
import { BotPage } from '../pages/bot/BotPage';
import { EquipoPage } from '../pages/configuracion/EquipoPage';
import { ConfiguracionPage } from '../pages/configuracion/ConfiguracionPage';
import { ViverosRootPage } from '../pages/root/ViverosRootPage';
import { SoloRol } from './SoloRol';

export const router = createBrowserRouter([
  { element: <AuthLayout />, children: [{ path: '/login', element: <LoginPage /> }] },
  {
    element: <DashboardLayout />,
    children: [
      { path: '/', element: <InicioPage /> },
      { path: '/chats', element: <ChatsPage /> },
      { path: '/chats/:id', element: <ChatsPage /> },
      { path: '/pedidos', element: <PedidosPage /> },
      { path: '/catalogo', element: <CatalogoPage /> },
      { path: '/clientes', element: <ClientesPage /> },
      { path: '/campanias', element: <SoloRol roles={['root', 'admin']}><CampaniasPage /></SoloRol> },
      { path: '/bot', element: <SoloRol roles={['root', 'admin']}><BotPage /></SoloRol> },
      { path: '/equipo', element: <SoloRol roles={['root', 'admin']}><EquipoPage /></SoloRol> },
      { path: '/configuracion', element: <SoloRol roles={['root', 'admin']}><ConfiguracionPage /></SoloRol> },
      { path: '/root/viveros', element: <SoloRol roles={['root']}><ViverosRootPage /></SoloRol> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
