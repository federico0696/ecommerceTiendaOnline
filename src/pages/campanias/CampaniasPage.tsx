import { FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { notificacionesApi } from '../../api/servicios';
import { mensajeError } from '../../api/cliente';
import { Area, Boton, Campo, Etiqueta, Selector, Tarjeta, Titulo, Vacio } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import type { Notificacion } from '../../interfaces';
import { fecha } from '../../utils/formato';

const CLASE_ESTADO = { enviada: 'bg-verde-100 text-verde-700', simulada: 'bg-sky-100 text-sky-800', fallida: 'bg-red-100 text-red-700', pendiente: 'bg-stone-100 text-stone-600' };

export const CampaniasPage = () => {
  const { viveroActualId } = useAuth();
  const [form, setForm] = useState({ canal: 'push', titulo: '', cuerpo: '' });
  const [historial, setHistorial] = useState<Notificacion[]>([]);
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(() => { if (viveroActualId) notificacionesApi.historial().then((r) => setHistorial(r.datos)).catch(() => undefined); }, [viveroActualId]);
  useEffect(cargar, [cargar]);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirm('Se envía a TODOS los clientes del vivero que aceptan notificaciones. ¿Continuar?')) return;
    setEnviando(true);
    try {
      const r = await notificacionesApi.enviar(form);
      toast.success(`Campaña enviada a ${r.clientes} cliente(s)`);
      setForm({ canal: 'push', titulo: '', cuerpo: '' });
      cargar();
    } catch (err) { toast.error(mensajeError(err)); } finally { setEnviando(false); }
  };

  return (
    <>
      <Titulo sub="Avisos masivos por push, WhatsApp o email. Mientras las integraciones estén apagadas, los envíos quedan registrados como simulados.">Campañas</Titulo>
      <div className="grid gap-4 lg:grid-cols-3">
        <Tarjeta titulo="Nueva campaña">
          <form onSubmit={enviar} className="space-y-2">
            <Selector etiqueta="Canal" value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value })}>
              <option value="push">Push (app)</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option>
            </Selector>
            <Campo etiqueta="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required maxLength={160} />
            <Area etiqueta="Mensaje" rows={4} value={form.cuerpo} onChange={(e) => setForm({ ...form, cuerpo: e.target.value })} required />
            <Boton type="submit" className="w-full" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar a todos'}</Boton>
          </form>
        </Tarjeta>
        <Tarjeta className="lg:col-span-2" titulo="Últimos envíos">
          {historial.length === 0 ? <Vacio texto="Sin envíos todavía." /> : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-stone-400"><tr><th className="py-2">Fecha</th><th>Canal</th><th>Título</th><th>Origen</th><th>Estado</th></tr></thead>
              <tbody className="divide-y divide-stone-100">
                {historial.map((n) => (
                  <tr key={n.id}><td className="py-2 text-stone-500">{fecha(n.creadoEn)}</td><td>{n.canal}</td><td>{n.titulo}</td><td className="text-stone-500">{n.origen}</td><td><Etiqueta clase={CLASE_ESTADO[n.estado]}>{n.estado}</Etiqueta></td></tr>
                ))}
              </tbody>
            </table>
          )}
        </Tarjeta>
      </div>
    </>
  );
};
