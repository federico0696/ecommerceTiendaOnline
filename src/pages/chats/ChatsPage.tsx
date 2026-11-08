import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Bot, MessageSquare, Phone, Smartphone, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import { conversacionesApi } from '../../api/servicios';
import { mensajeError } from '../../api/cliente';
import { Boton, Campo, Etiqueta, Vacio } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import type { Conversacion, Mensaje } from '../../interfaces';
import { hace } from '../../utils/formato';

const ICONO_CANAL = { app: Smartphone, web: Globe, whatsapp: Phone };

/** Bandeja de conversaciones en vivo: lista a la izquierda, chat a la derecha. */
export const ChatsPage = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { viveroActualId } = useAuth();
  const [lista, setLista] = useState<Conversacion[]>([]);
  const [filtroModo, setFiltroModo] = useState(params.get('modo') ?? '');
  const [actual, setActual] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const finRef = useRef<HTMLDivElement>(null);

  const cargarLista = useCallback(() => {
    if (!viveroActualId) return;
    conversacionesApi.listar({ estado: 'abierta', ...(filtroModo ? { modo: filtroModo } : {}) }).then((r) => setLista(r.datos)).catch(() => undefined);
  }, [viveroActualId, filtroModo]);

  const cargarActual = useCallback(() => {
    if (!id) { setActual(null); setMensajes([]); return; }
    conversacionesApi.obtener(id).then(setActual).catch(() => navigate('/chats'));
    conversacionesApi.mensajes(id).then((r) => setMensajes(r.datos)).catch(() => undefined);
  }, [id, navigate]);

  useEffect(cargarLista, [cargarLista]);
  useEffect(cargarActual, [cargarActual]);
  useEffect(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), [mensajes]);

  useSocket({
    'mensaje:nuevo': (p: { conversacionId: string; mensaje: Mensaje }) => {
      if (p.conversacionId === id) setMensajes((m) => (m.some((x) => x.id === p.mensaje.id) ? m : [...m, p.mensaje]));
      cargarLista();
    },
    'conversacion:actualizada': () => { cargarLista(); if (id) conversacionesApi.obtener(id).then(setActual).catch(() => undefined); },
  }, Boolean(viveroActualId));

  const responder = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !texto.trim()) return;
    try {
      const m = await conversacionesApi.responder(id, texto.trim());
      setMensajes((ms) => (ms.some((x) => x.id === m.id) ? ms : [...ms, m]));
      setTexto('');
      cargarActual();
    } catch (err) { toast.error(mensajeError(err)); }
  };

  const accion = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); toast.success(ok); cargarActual(); cargarLista(); } catch (err) { toast.error(mensajeError(err)); }
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <aside className="flex w-80 shrink-0 flex-col border-r border-stone-200">
        <div className="flex gap-1 border-b border-stone-200 p-2">
          {[['', 'Todas'], ['humano', 'Con persona'], ['bot', 'Con bot']].map(([v, t]) => (
            <button key={v} onClick={() => setFiltroModo(v)} className={`flex-1 rounded-md px-2 py-1 text-xs ${filtroModo === v ? 'bg-verde-600 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>{t}</button>
          ))}
        </div>
        <ul className="flex-1 overflow-auto">
          {lista.length === 0 && <Vacio texto="Sin conversaciones abiertas." />}
          {lista.map((c) => {
            const Icono = ICONO_CANAL[c.canal] ?? MessageSquare;
            return (
              <li key={c.id}>
                <button onClick={() => navigate(`/chats/${c.id}`)} className={`flex w-full items-start gap-3 border-b border-stone-100 px-3 py-3 text-left hover:bg-stone-50 ${c.id === id ? 'bg-verde-50' : ''}`}>
                  <span className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full ${c.modo === 'humano' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}`}><Icono size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{c.cliente?.nombre}</span>
                      <span className="shrink-0 text-xs text-stone-400">{hace(c.ultimoMensajeEn)}</span>
                    </span>
                    <span className="block truncate text-xs text-stone-500">{c.ultimoMensajeTexto}</span>
                    <span className="mt-1 flex items-center gap-1">
                      {c.modo === 'humano' && <Etiqueta clase="bg-amber-100 text-amber-800">{c.asignadoA ? c.asignadoA.nombre : 'sin asignar'}</Etiqueta>}
                      {c.noLeidosPanel > 0 && <Etiqueta clase="bg-verde-600 text-white">{c.noLeidosPanel}</Etiqueta>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        {!actual ? <Vacio texto="Elegí una conversación." /> : (
          <>
            <header className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3">
              <div>
                <p className="font-medium">{actual.cliente?.nombre} <span className="text-xs text-stone-400">· {actual.canal}</span></p>
                <p className="text-xs text-stone-500">
                  {actual.modo === 'bot' ? 'Responde el asistente. Si escribís, la tomás vos.' : `En manos de ${actual.asignadoA?.nombre ?? 'nadie todavía'}${actual.motivoDerivacion ? ` · ${actual.motivoDerivacion}` : ''}`}
                </p>
              </div>
              <div className="flex gap-2">
                {actual.modo === 'humano' && !actual.asignadoAId && <Boton variante="secundario" onClick={() => accion(() => conversacionesApi.asignarme(actual.id), 'Conversación tomada')}>Tomar</Boton>}
                {actual.modo === 'humano' && <Boton variante="secundario" onClick={() => accion(() => conversacionesApi.devolverAlBot(actual.id), 'Volvió al asistente')}><Bot size={14} className="mr-1 inline" />Devolver al bot</Boton>}
                <Boton variante="fantasma" onClick={() => accion(() => conversacionesApi.cerrar(actual.id), 'Conversación cerrada')}>Cerrar</Boton>
              </div>
            </header>
            {actual.resumenIa && <p className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-900"><b>Resumen:</b> {actual.resumenIa}</p>}
            <div className="flex-1 space-y-2 overflow-auto bg-stone-50 p-4">
              {mensajes.map((m) => (
                <div key={m.id} className={`flex ${m.emisor === 'cliente' ? 'justify-start' : m.emisor === 'sistema' ? 'justify-center' : 'justify-end'}`}>
                  <div className={`max-w-[70%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    m.emisor === 'cliente' ? 'bg-white' : m.emisor === 'bot' ? 'bg-verde-100 text-verde-900' : m.emisor === 'sistema' ? 'bg-transparent text-xs text-stone-400 shadow-none' : 'bg-verde-600 text-white'}`}>
                    {m.emisor !== 'sistema' && <p className="mb-0.5 text-[10px] uppercase opacity-60">{m.emisor}</p>}
                    {m.contenido}
                  </div>
                </div>
              ))}
              <div ref={finRef} />
            </div>
            <form onSubmit={responder} className="flex gap-2 border-t border-stone-200 p-3">
              <Campo className="flex-1" placeholder="Escribí tu respuesta…" value={texto} onChange={(e) => setTexto(e.target.value)} />
              <Boton type="submit" disabled={!texto.trim()}>Enviar</Boton>
            </form>
          </>
        )}
      </section>
    </div>
  );
};
