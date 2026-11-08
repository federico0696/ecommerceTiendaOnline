import { useEffect, useState } from 'react';
import { clientesApi } from '../../api/servicios';
import { Campo, Etiqueta, Tarjeta, Titulo, Vacio } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import type { Cliente } from '../../interfaces';
import { fecha } from '../../utils/formato';

export const ClientesPage = () => {
  const { viveroActualId } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [buscar, setBuscar] = useState('');

  useEffect(() => {
    if (!viveroActualId) return;
    clientesApi.listar(buscar).then((r) => setClientes(r.datos)).catch(() => undefined);
  }, [viveroActualId, buscar]);

  return (
    <>
      <Titulo sub="Personas que usan la app o escribieron por WhatsApp.">Clientes</Titulo>
      <Tarjeta acciones={<Campo placeholder="Buscar por nombre, email o WhatsApp…" value={buscar} onChange={(e) => setBuscar(e.target.value)} className="w-80" />}>
        {clientes.length === 0 ? <Vacio texto="Todavía no hay clientes." /> : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-stone-400"><tr><th className="py-2">Nombre</th><th>Email</th><th>WhatsApp</th><th>Alta</th><th>Último acceso</th><th></th></tr></thead>
            <tbody className="divide-y divide-stone-100">
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 font-medium">{c.nombre}</td>
                  <td className="text-stone-500">{c.email}</td>
                  <td className="text-stone-500">{c.whatsapp ?? '-'}</td>
                  <td className="text-stone-500">{fecha(c.creadoEn)}</td>
                  <td className="text-stone-500">{fecha(c.ultimoAcceso)}</td>
                  <td>{!c.activo && <Etiqueta clase="bg-red-100 text-red-700">inactivo</Etiqueta>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>
    </>
  );
};
