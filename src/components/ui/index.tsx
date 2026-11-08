import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

/** Componentes de interfaz mínimos y consistentes. Cuando crezca, se reemplazan por una librería o un design system. */

export const Boton = ({ variante = 'primario', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' | 'peligro' | 'fantasma' }) => {
  const estilos = {
    primario: 'bg-verde-600 text-white hover:bg-verde-700',
    secundario: 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100',
    peligro: 'bg-red-600 text-white hover:bg-red-700',
    fantasma: 'text-stone-600 hover:bg-stone-100',
  }[variante];
  return <button className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${estilos} ${className}`} {...p} />;
};

export const Campo = ({ etiqueta, className = '', ...p }: InputHTMLAttributes<HTMLInputElement> & { etiqueta?: string }) => (
  <label className={`block text-sm ${className}`}>
    {etiqueta && <span className="mb-1 block text-stone-600">{etiqueta}</span>}
    <input className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-100" {...p} />
  </label>
);

export const Area = ({ etiqueta, className = '', ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { etiqueta?: string }) => (
  <label className={`block text-sm ${className}`}>
    {etiqueta && <span className="mb-1 block text-stone-600">{etiqueta}</span>}
    <textarea className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-100" {...p} />
  </label>
);

export const Selector = ({ etiqueta, className = '', children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { etiqueta?: string }) => (
  <label className={`block text-sm ${className}`}>
    {etiqueta && <span className="mb-1 block text-stone-600">{etiqueta}</span>}
    <select className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-verde-500" {...p}>{children}</select>
  </label>
);

export const Tarjeta = ({ titulo, acciones, children, className = '' }: { titulo?: string; acciones?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={`rounded-xl border border-stone-200 bg-white p-4 shadow-sm ${className}`}>
    {(titulo || acciones) && (
      <header className="mb-3 flex items-center justify-between gap-2">
        {titulo && <h2 className="text-base font-semibold text-stone-800">{titulo}</h2>}
        {acciones}
      </header>
    )}
    {children}
  </section>
);

export const Etiqueta = ({ children, clase = 'bg-stone-100 text-stone-700' }: { children: ReactNode; clase?: string }) => (
  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${clase}`}>{children}</span>
);

export const Vacio = ({ texto }: { texto: string }) => <p className="py-8 text-center text-sm text-stone-400">{texto}</p>;

export const Cargando = () => <p className="py-8 text-center text-sm text-stone-400">Cargando…</p>;

export const Titulo = ({ children, sub }: { children: ReactNode; sub?: string }) => (
  <div className="mb-4">
    <h1 className="text-2xl font-semibold text-stone-800">{children}</h1>
    {sub && <p className="text-sm text-stone-500">{sub}</p>}
  </div>
);
