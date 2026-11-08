export const dinero = (n: number | string) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(n));

export const fecha = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso)) : '-';

export const hace = (iso: string | null | undefined) => {
  if (!iso) return '';
  const seg = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seg < 60) return 'ahora';
  if (seg < 3600) return `hace ${Math.floor(seg / 60)} min`;
  if (seg < 86400) return `hace ${Math.floor(seg / 3600)} h`;
  return `hace ${Math.floor(seg / 86400)} d`;
};

export const ESTADOS_PEDIDO: Record<string, { texto: string; clase: string; siguientes: string[] }> = {
  pendiente: { texto: 'Pendiente', clase: 'bg-amber-100 text-amber-800', siguientes: ['confirmado', 'cancelado'] },
  confirmado: { texto: 'Confirmado', clase: 'bg-sky-100 text-sky-800', siguientes: ['preparando', 'cancelado'] },
  preparando: { texto: 'Preparando', clase: 'bg-indigo-100 text-indigo-800', siguientes: ['listo', 'cancelado'] },
  listo: { texto: 'Listo', clase: 'bg-verde-100 text-verde-700', siguientes: ['en_camino', 'entregado', 'cancelado'] },
  en_camino: { texto: 'En camino', clase: 'bg-teal-100 text-teal-800', siguientes: ['entregado'] },
  entregado: { texto: 'Entregado', clase: 'bg-stone-200 text-stone-700', siguientes: [] },
  cancelado: { texto: 'Cancelado', clase: 'bg-red-100 text-red-800', siguientes: [] },
};
