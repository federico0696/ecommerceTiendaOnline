import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { viverosApi } from '../../api/servicios';
import { mensajeError } from '../../api/cliente';
import { viveroSeleccionado } from '../../app/slices/auth.slice';
import { Boton, Campo, Etiqueta, Tarjeta, Titulo, Vacio } from '../../components/ui';
import type { Vivero } from '../../interfaces';

/** Solo root: alta y listado de viveros (tenants). */
export const ViverosRootPage = () => {
  const dispatch = useDispatch();
  const [viveros, setViveros] = useState<Vivero[]>([]);
  const [form, setForm] = useState({ nombre: '', slug: '', ciudad: '', telefono: '' });

  const cargar = useCallback(() => { viverosApi.listar().then((r) => setViveros(r.datos)).catch(() => undefined); }, []);
  useEffect(cargar, [cargar]);

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const v = await viverosApi.crear(form);
      toast.success(`Vivero "${v.nombre}" creado. Ahora creale un admin en Equipo.`);
      dispatch(viveroSeleccionado(v.id));
      setForm({ nombre: '', slug: '', ciudad: '', telefono: '' });
      cargar();
    } catch (err) { toast.error(mensajeError(err)); }
  };

  const slugDesde = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  return (
    <>
      <Titulo sub="Cada vivero es un cliente de la plataforma, con sus propios datos aislados.">Viveros</Titulo>
      <div className="grid gap-4 lg:grid-cols-3">
        <Tarjeta titulo="Nuevo vivero">
          <form onSubmit={crear} className="space-y-2">
            <Campo etiqueta="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value, slug: slugDesde(e.target.value) })} required />
            <Campo etiqueta="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required pattern="[a-z0-9-]+" />
            <Campo etiqueta="Ciudad" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            <Campo etiqueta="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <Boton type="submit" className="w-full">Crear vivero</Boton>
          </form>
        </Tarjeta>
        <Tarjeta className="lg:col-span-2" titulo="Todos los viveros">
          {viveros.length === 0 ? <Vacio texto="Todavía no hay viveros. Creá el primero." /> : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-stone-400"><tr><th className="py-2">Nombre</th><th>Slug</th><th>Ciudad</th><th>IA</th><th></th></tr></thead>
              <tbody className="divide-y divide-stone-100">
                {viveros.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2 font-medium">{v.nombre} {!v.activo && <Etiqueta clase="bg-red-100 text-red-700">inactivo</Etiqueta>}</td>
                    <td className="text-stone-500">{v.slug}</td><td className="text-stone-500">{v.ciudad ?? '-'}</td>
                    <td><Etiqueta>{v.configuracion.ia.proveedor ?? 'plataforma'}</Etiqueta></td>
                    <td className="text-right"><Boton variante="secundario" className="px-2 py-1 text-xs" onClick={() => dispatch(viveroSeleccionado(v.id))}>Operar</Boton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Tarjeta>
      </div>
    </>
  );
};
