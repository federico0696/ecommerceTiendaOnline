import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalogoApi, conversacionesApi, pedidosApi } from '../../api/servicios';
import { Etiqueta, Tarjeta, Titulo, Vacio } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import type { Producto } from '../../interfaces';
import { ESTADOS_PEDIDO } from '../../utils/formato';

const Numero = ({ valor, texto, a }: { valor: number | string; texto: string; a?: string }) => {
  const contenido = (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-verde-200">
      <p className="text-3xl font-semibold text-verde-700">{valor}</p>
      <p className="text-sm text-stone-500">{texto}</p>
    </div>
  );
  return a ? <Link to={a}>{contenido}</Link> : contenido;
};

export const InicioPage = () => {
  const { usuario, viveroActualId } = useAuth();
  const [pedidos, setPedidos] = useState<Record<string, number>>({});
  const [chats, setChats] = useState({ abiertas: 0, enHumano: 0, sinAsignar: 0, noLeidos: 0 });
  const [stockBajo, setStockBajo] = useState<Producto[]>([]);

  const cargar = () => {
    if (!viveroActualId) return;
    pedidosApi.resumen().then((r) => setPedidos(r.porEstado)).catch(() => undefined);
    conversacionesApi.resumen().then(setChats).catch(() => undefined);
    catalogoApi.stockBajo().then(setStockBajo).catch(() => undefined);
  };
  useEffect(cargar, [viveroActualId]);
  useSocket({ 'pedido:nuevo': cargar, 'pedido:actualizado': cargar, 'conversacion:actualizada': cargar, 'mensaje:nuevo': cargar }, Boolean(viveroActualId));

  return (
    <>
      <Titulo sub="Lo que necesita atención ahora">Hola, {usuario?.nombre}</Titulo>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Numero valor={pedidos.pendiente ?? 0} texto="Pedidos pendientes" a="/pedidos?estado=pendiente" />
        <Numero valor={pedidos.preparando ?? 0} texto="En preparación" a="/pedidos?estado=preparando" />
        <Numero valor={chats.sinAsignar} texto="Chats esperando una persona" a="/chats?modo=humano" />
        <Numero valor={chats.noLeidos} texto="Mensajes sin leer" a="/chats" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Pedidos por estado">
          <ul className="divide-y divide-stone-100 text-sm">
            {Object.entries(ESTADOS_PEDIDO).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between py-2">
                <Etiqueta clase={v.clase}>{v.texto}</Etiqueta>
                <span className="font-medium">{pedidos[k] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
        <Tarjeta titulo="Stock bajo" acciones={<Link to="/catalogo" className="text-sm text-verde-600">Ver catálogo</Link>}>
          {stockBajo.length === 0 ? <Vacio texto="Todo el stock está por encima del mínimo." /> : (
            <ul className="divide-y divide-stone-100 text-sm">
              {stockBajo.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>{p.nombre}</span>
                  <span className={p.stock === 0 ? 'font-semibold text-red-600' : 'text-amber-600'}>{p.stock} u. (mín. {p.stockMinimo})</span>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </>
  );
};
