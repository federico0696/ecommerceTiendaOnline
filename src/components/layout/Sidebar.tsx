import { NavLink } from 'react-router-dom';
import { Bot, Boxes, Building2, Home, Leaf, Megaphone, MessageSquare, Settings, ShoppingBag, Users, UserCog, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Item { a: string; texto: string; icono: LucideIcon; soloAdmin?: boolean; soloRoot?: boolean }

const ITEMS: Item[] = [
  { a: '/', texto: 'Inicio', icono: Home },
  { a: '/chats', texto: 'Conversaciones', icono: MessageSquare },
  { a: '/pedidos', texto: 'Pedidos', icono: ShoppingBag },
  { a: '/catalogo', texto: 'Catálogo y stock', icono: Boxes },
  { a: '/clientes', texto: 'Clientes', icono: Users },
  { a: '/campanias', texto: 'Campañas', icono: Megaphone, soloAdmin: true },
  { a: '/bot', texto: 'Asistente (bot)', icono: Bot, soloAdmin: true },
  { a: '/equipo', texto: 'Equipo', icono: UserCog, soloAdmin: true },
  { a: '/configuracion', texto: 'Mi vivero', icono: Settings, soloAdmin: true },
  { a: '/root/viveros', texto: 'Viveros (root)', icono: Building2, soloRoot: true },
];

export const Sidebar = () => {
  const { esAdmin, esRoot } = useAuth();
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-stone-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-verde-600 text-white"><Leaf size={20} /></span>
        <div>
          <p className="text-sm font-semibold leading-tight">{import.meta.env.VITE_APP_NOMBRE}</p>
          <p className="text-xs text-stone-400">gestión de viveros</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {ITEMS.filter((i) => (!i.soloAdmin || esAdmin) && (!i.soloRoot || esRoot)).map((i) => (
          <NavLink
            key={i.a}
            to={i.a}
            end={i.a === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-verde-50 font-medium text-verde-700' : 'text-stone-600 hover:bg-stone-100'}`
            }
          >
            <i.icono size={18} /> {i.texto}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
