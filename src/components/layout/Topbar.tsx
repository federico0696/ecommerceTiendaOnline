import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { LogOut } from 'lucide-react';
import { viveroSeleccionado } from '../../app/slices/auth.slice';
import { viverosApi } from '../../api/servicios';
import { useAuth } from '../../hooks/useAuth';
import type { Vivero } from '../../interfaces';
import { Boton, Selector } from '../ui';

/** Barra superior: quién soy, y para root el selector de vivero sobre el que opera. */
export const Topbar = () => {
  const { usuario, esRoot, viveroActualId, salir } = useAuth();
  const dispatch = useDispatch();
  const [viveros, setViveros] = useState<Vivero[]>([]);

  useEffect(() => {
    if (esRoot) viverosApi.listar().then((r) => setViveros(r.datos)).catch(() => undefined);
  }, [esRoot]);

  return (
    <header className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-6">
      <div className="flex items-center gap-3">
        {esRoot && (
          <Selector value={viveroActualId ?? ''} onChange={(e) => dispatch(viveroSeleccionado(e.target.value || null))} className="w-64">
            <option value="">Elegí un vivero para operar…</option>
            {viveros.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </Selector>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-stone-600">{usuario?.nombre} <span className="text-stone-400">· {usuario?.rol}</span></span>
        <Boton variante="fantasma" onClick={salir} title="Cerrar sesión"><LogOut size={16} /></Boton>
      </div>
    </header>
  );
};
