import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { botApi, viverosApi } from '../../api/servicios';
import { mensajeError } from '../../api/cliente';
import { Area, Boton, Campo, Etiqueta, Selector, Tarjeta, Titulo } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import type { Vivero } from '../../interfaces';

interface Turno { quien: 'vos' | 'bot'; texto: string; meta?: string }

export const BotPage = () => {
  const { viveroActualId } = useAuth();
  const [vivero, setVivero] = useState<Vivero | null>(null);
  const [herramientas, setHerramientas] = useState<{ nombre: string; descripcion: string }[]>([]);
  const [proveedores, setProveedores] = useState<string[]>([]);
  const [ia, setIa] = useState({ proveedor: '', nombreBot: '', instruccionesExtra: '' });
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [pensando, setPensando] = useState(false);

  useEffect(() => {
    if (!viveroActualId) return;
    viverosApi.obtener(viveroActualId).catch(() => viverosApi.mio()).then((v) => {
      setVivero(v);
      setIa({ proveedor: v.configuracion.ia.proveedor ?? '', nombreBot: v.configuracion.ia.nombreBot, instruccionesExtra: v.configuracion.ia.instruccionesExtra });
    }).catch(() => undefined);
    botApi.herramientas().then(setHerramientas).catch(() => undefined);
    botApi.proveedores().then((r) => setProveedores(r.disponibles)).catch(() => undefined);
  }, [viveroActualId]);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (!vivero) return;
    try {
      await viverosApi.actualizar(vivero.id, { configuracion: { ia: { ...ia, proveedor: (ia.proveedor || null) as Vivero['configuracion']['ia']['proveedor'] } } });
      toast.success('Configuración del asistente guardada');
    } catch (err) { toast.error(mensajeError(err)); }
  };

  const probar = async (e: FormEvent) => {
    e.preventDefault();
    const texto = mensaje.trim();
    if (!texto) return;
    setTurnos((t) => [...t, { quien: 'vos', texto }]);
    setMensaje('');
    setPensando(true);
    try {
      const r = await botApi.probar(texto);
      setTurnos((t) => [...t, { quien: 'bot', texto: r.texto, meta: `${r.proveedor} · ${r.modelo}${r.herramientasUsadas.length ? ` · ${r.herramientasUsadas.join(', ')}` : ''}${r.derivado ? ' · DERIVÓ' : ''}` }]);
    } catch (err) { toast.error(mensajeError(err)); } finally { setPensando(false); }
  };

  return (
    <>
      <Titulo sub="Cómo se presenta, qué proveedor de IA usa y qué instrucciones extra sigue. Probalo acá antes de que lo vean los clientes.">Asistente virtual</Titulo>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Tarjeta titulo="Configuración">
            <form onSubmit={guardar} className="space-y-2">
              <Campo etiqueta="Nombre del asistente" value={ia.nombreBot} onChange={(e) => setIa({ ...ia, nombreBot: e.target.value })} required />
              <Selector etiqueta="Proveedor de IA" value={ia.proveedor} onChange={(e) => setIa({ ...ia, proveedor: e.target.value })}>
                <option value="">El de la plataforma (por defecto)</option>
                <option value="mock">mock (demo, sin IA real)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </Selector>
              <p className="text-xs text-stone-500">Con credenciales cargadas: {proveedores.join(', ') || '-'}. Si el elegido no las tiene, se usa mock.</p>
              <Area etiqueta="Instrucciones extra del vivero" rows={6} value={ia.instruccionesExtra} onChange={(e) => setIa({ ...ia, instruccionesExtra: e.target.value })}
                placeholder="Ej: Los martes hacemos 10% de descuento en suculentas. No vendemos plantas por mayor. Si preguntan por paisajismo, derivá a una persona." />
              <Boton type="submit">Guardar</Boton>
            </form>
          </Tarjeta>
          <Tarjeta titulo="Herramientas que puede usar">
            <ul className="space-y-1 text-sm">{herramientas.map((h) => <li key={h.nombre}><Etiqueta>{h.nombre}</Etiqueta> <span className="text-stone-500">{h.descripcion.slice(0, 110)}…</span></li>)}</ul>
          </Tarjeta>
        </div>
        <Tarjeta titulo="Probar el asistente" className="flex h-[36rem] flex-col">
          <div className="flex-1 space-y-2 overflow-auto rounded-lg bg-stone-50 p-3">
            {turnos.length === 0 && <p className="text-center text-sm text-stone-400">Escribile como si fueras un cliente.</p>}
            {turnos.map((t, i) => (
              <div key={i} className={`flex ${t.quien === 'vos' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${t.quien === 'vos' ? 'bg-verde-600 text-white' : 'bg-white shadow-sm'}`}>
                  {t.texto}{t.meta && <p className="mt-1 text-[10px] text-stone-400">{t.meta}</p>}
                </div>
              </div>
            ))}
            {pensando && <p className="text-xs text-stone-400">pensando…</p>}
          </div>
          <form onSubmit={probar} className="mt-2 flex gap-2">
            <Campo className="flex-1" placeholder="Hola, ¿tenés monsteras?" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
            <Boton type="submit" disabled={pensando}>Enviar</Boton>
          </form>
        </Tarjeta>
      </div>
    </>
  );
};
