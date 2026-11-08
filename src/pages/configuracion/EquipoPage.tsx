import { FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { usuariosApi } from '../../api/servicios';
import { mensajeError } from '../../api/cliente';
import { Boton, Campo, Etiqueta, Selector, Tarjeta, Titulo, Vacio } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import type { Usuario } from '../../interfaces';
import { fecha } from '../../utils/formato';

/** Admins y empleados del vivero. */
export const EquipoPage = () => {
  const { viveroActualId, esRoot } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'empleado' as 'admin' | 'empleado' });

  const cargar = useCallback(() => { if (viveroActualId) usuariosApi.listar(esRoot ? viveroActualId : undefined).then((r) => setUsuarios(r.datos)).catch(() => undefined); }, [viveroActualId, esRoot]);
  useEffect(cargar, [cargar]);

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await usuariosApi.crear({ ...form, viveroId: esRoot ? viveroActualId ?? undefined : undefined });
      toast.success('Usuario creado');
      setForm({ nombre: '', email: '', password: '', rol: 'empleado' });
      cargar();
    } catch (err) { toast.error(mensajeError(err)); }
  };

  const alternar = async (u: Usuario) => {
    try { await usuariosApi.actualizar(u.id, { activo: !u.activo }); cargar(); } catch (err) { toast.error(mensajeError(err)); }
  };

  return (
    <>
      <Titulo sub="Quiénes entran al panel de este vivero. Los admins administran todo; los empleados atienden.">Equipo</Titulo>
      <div className="grid gap-4 lg:grid-cols-3">
        <Tarjeta titulo="Nuevo integrante">
          <form onSubmit={crear} className="space-y-2">
            <Campo etiqueta="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <Campo etiqueta="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Campo etiqueta="Contraseña inicial" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Selector etiqueta="Rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as 'admin' | 'empleado' })}><option value="empleado">Empleado</option><option value="admin">Admin</option></Selector>
            <Boton type="submit" className="w-full">Crear</Boton>
          </form>
        </Tarjeta>
        <Tarjeta className="lg:col-span-2" titulo="Integrantes">
          {usuarios.length === 0 ? <Vacio texto="Todavía no hay integrantes." /> : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-stone-400"><tr><th className="py-2">Nombre</th><th>Email</th><th>Rol</th><th>Último acceso</th><th></th></tr></thead>
              <tbody className="divide-y divide-stone-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className={u.activo ? '' : 'opacity-50'}>
                    <td className="py-2 font-medium">{u.nombre}</td><td className="text-stone-500">{u.email}</td><td><Etiqueta>{u.rol}</Etiqueta></td><td className="text-stone-500">{fecha(u.ultimoAcceso)}</td>
                    <td className="text-right"><Boton variante="fantasma" className="px-2 py-1 text-xs" onClick={() => alternar(u)}>{u.activo ? 'Desactivar' : 'Activar'}</Boton></td>
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
