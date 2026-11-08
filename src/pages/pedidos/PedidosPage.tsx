import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { pedidosApi } from '../../api/servicios';
import { mensajeError } from '../../api/cliente';
import { Boton, Etiqueta, Selector, Tarjeta, Titulo, Vacio } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import type { Pedido } from '../../interfaces';
import { dinero, ESTADOS_PEDIDO, fecha } from '../../utils/formato';

export const PedidosPage = () => {
  const [params, setParams] = useSearchParams();
  const estado = params.get('estado') ?? '';
  const { viveroActualId } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [abierto, setAbierto] = useState<string | null>(null);

  const cargar = useCallback(() => {
    if (!viveroActualId) return;
    pedidosApi.listar(estado ? { estado } : {}).then((r) => setPedidos(r.datos)).catch(() => undefined);
  }, [viveroActualId, estado]);
  useEffect(cargar, [cargar]);
  useSocket({ 'pedido:nuevo': cargar, 'pedido:actualizado': cargar }, Boolean(viveroActualId));

  const cambiar = async (p: Pedido, nuevo: string) => {
    try {
      await pedidosApi.cambiarEstado(p.id, nuevo);
      toast.success(`Pedido #${p.numero}: ${ESTADOS_PEDIDO[nuevo].texto}`);
      cargar();
    } catch (e) { toast.error(mensajeError(e)); }
  };

  return (
    <>
      <Titulo sub="Avanzá cada pedido por sus estados. El cliente recibe un aviso en cada cambio.">Pedidos</Titulo>
      <Tarjeta acciones={
        <Selector value={estado} onChange={(e) => setParams(e.target.value ? { estado: e.target.value } : {})}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_PEDIDO).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}
        </Selector>
      }>
        {pedidos.length === 0 ? <Vacio texto="No hay pedidos con ese filtro." /> : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-stone-400"><tr><th className="py-2">#</th><th>Cliente</th><th>Fecha</th><th>Entrega</th><th>Total</th><th>Estado</th><th></th></tr></thead>
            <tbody className="divide-y divide-stone-100">
              {pedidos.map((p) => (
                <>
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="py-2 font-medium">#{p.numero}</td>
                    <td>{p.cliente?.nombre}</td>
                    <td className="text-stone-500">{fecha(p.creadoEn)}</td>
                    <td>{p.tipoEntrega}</td>
                    <td>{dinero(p.total)}</td>
                    <td><Etiqueta clase={ESTADOS_PEDIDO[p.estado].clase}>{ESTADOS_PEDIDO[p.estado].texto}</Etiqueta></td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        {ESTADOS_PEDIDO[p.estado].siguientes.map((s) => (
                          <Boton key={s} variante={s === 'cancelado' ? 'peligro' : 'secundario'} className="px-2 py-1 text-xs" onClick={() => cambiar(p, s)}>{ESTADOS_PEDIDO[s].texto}</Boton>
                        ))}
                        <Boton variante="fantasma" className="px-2 py-1 text-xs" onClick={() => setAbierto(abierto === p.id ? null : p.id)}>{abierto === p.id ? 'Ocultar' : 'Detalle'}</Boton>
                      </div>
                    </td>
                  </tr>
                  {abierto === p.id && (
                    <tr key={`${p.id}-d`} className="bg-stone-50"><td colSpan={7} className="px-4 py-3">
                      <ul className="mb-2 text-sm">{p.items.map((i) => <li key={i.id}>{i.cantidad} × {i.nombreProducto} <span className="text-stone-400">({dinero(i.precioUnitario)} c/u)</span></li>)}</ul>
                      <p className="text-xs text-stone-500">Historial: {p.historialEstados.map((h) => `${ESTADOS_PEDIDO[h.estado].texto} (${fecha(h.fecha)})`).join(' → ')}</p>
                    </td></tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>
    </>
  );
};
