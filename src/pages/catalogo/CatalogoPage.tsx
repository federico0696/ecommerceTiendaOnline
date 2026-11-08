import { FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { catalogoApi } from '../../api/servicios';
import { mensajeError } from '../../api/cliente';
import { Boton, Campo, Etiqueta, Selector, Tarjeta, Titulo, Vacio } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import type { Categoria, Producto } from '../../interfaces';
import { dinero } from '../../utils/formato';

const TIPOS = ['planta', 'flor', 'semilla', 'maceta', 'sustrato', 'herramienta', 'insumo', 'otro'];

export const CatalogoPage = () => {
  const { viveroActualId } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [buscar, setBuscar] = useState('');
  const [nuevo, setNuevo] = useState({ nombre: '', tipo: 'planta', categoriaId: '', precio: '', stock: '' });
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [ajuste, setAjuste] = useState<{ id: string; cantidad: string; motivo: string } | null>(null);

  const cargar = useCallback(() => {
    if (!viveroActualId) return;
    catalogoApi.categorias().then(setCategorias).catch(() => undefined);
    catalogoApi.productos({ buscar, limite: 100 }).then((r) => setProductos(r.datos)).catch(() => undefined);
  }, [viveroActualId, buscar]);
  useEffect(cargar, [cargar]);

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await catalogoApi.crearProducto({ nombre: nuevo.nombre, tipo: nuevo.tipo, categoriaId: nuevo.categoriaId || undefined, precio: Number(nuevo.precio), stock: Number(nuevo.stock || 0) });
      toast.success('Producto creado');
      setNuevo({ nombre: '', tipo: 'planta', categoriaId: '', precio: '', stock: '' });
      cargar();
    } catch (err) { toast.error(mensajeError(err)); }
  };

  const crearCategoria = async (e: FormEvent) => {
    e.preventDefault();
    try { await catalogoApi.crearCategoria(nuevaCategoria); setNuevaCategoria(''); toast.success('Categoría creada'); cargar(); } catch (err) { toast.error(mensajeError(err)); }
  };

  const aplicarAjuste = async (e: FormEvent) => {
    e.preventDefault();
    if (!ajuste) return;
    try { await catalogoApi.ajustarStock(ajuste.id, Number(ajuste.cantidad), ajuste.motivo); toast.success('Stock actualizado'); setAjuste(null); cargar(); } catch (err) { toast.error(mensajeError(err)); }
  };

  const alternar = async (p: Producto, campo: 'activo' | 'destacado') => {
    try { await catalogoApi.actualizarProducto(p.id, { [campo]: !p[campo] }); cargar(); } catch (err) { toast.error(mensajeError(err)); }
  };

  return (
    <>
      <Titulo sub="Productos, categorías y stock. La ficha de cuidados la lee el asistente para responder.">Catálogo y stock</Titulo>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Tarjeta titulo="Nuevo producto">
            <form onSubmit={crear} className="space-y-2">
              <Campo etiqueta="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} required />
              <Selector etiqueta="Tipo" value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</Selector>
              <Selector etiqueta="Categoría" value={nuevo.categoriaId} onChange={(e) => setNuevo({ ...nuevo, categoriaId: e.target.value })}>
                <option value="">Sin categoría</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Selector>
              <div className="grid grid-cols-2 gap-2">
                <Campo etiqueta="Precio" type="number" min={0} value={nuevo.precio} onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })} required />
                <Campo etiqueta="Stock inicial" type="number" min={0} value={nuevo.stock} onChange={(e) => setNuevo({ ...nuevo, stock: e.target.value })} />
              </div>
              <Boton type="submit" className="w-full">Crear</Boton>
            </form>
          </Tarjeta>
          <Tarjeta titulo="Categorías">
            <ul className="mb-2 flex flex-wrap gap-1">{categorias.map((c) => <Etiqueta key={c.id}>{c.nombre}</Etiqueta>)}</ul>
            <form onSubmit={crearCategoria} className="flex gap-2">
              <Campo className="flex-1" placeholder="Nueva categoría" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} required />
              <Boton type="submit" variante="secundario">Agregar</Boton>
            </form>
          </Tarjeta>
        </div>
        <Tarjeta className="lg:col-span-2" titulo="Productos" acciones={<Campo placeholder="Buscar…" value={buscar} onChange={(e) => setBuscar(e.target.value)} />}>
          {productos.length === 0 ? <Vacio texto="Todavía no hay productos." /> : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-stone-400"><tr><th className="py-2">Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
              <tbody className="divide-y divide-stone-100">
                {productos.map((p) => (
                  <tr key={p.id} className={p.activo ? '' : 'opacity-50'}>
                    <td className="py-2">
                      <p className="font-medium">{p.nombre} {p.destacado && <Etiqueta clase="bg-amber-100 text-amber-800">destacado</Etiqueta>}</p>
                      <p className="text-xs text-stone-400">{p.tipo}{p.nombreCientifico ? ` · ${p.nombreCientifico}` : ''}</p>
                    </td>
                    <td className="text-stone-500">{p.categoria?.nombre ?? '-'}</td>
                    <td>{dinero(p.precioOferta ?? p.precio)}{p.precioOferta && <span className="ml-1 text-xs text-stone-400 line-through">{dinero(p.precio)}</span>}</td>
                    <td className={p.stock <= p.stockMinimo ? 'font-semibold text-amber-600' : ''}>{p.stock}</td>
                    <td className="text-right">
                      {ajuste?.id === p.id ? (
                        <form onSubmit={aplicarAjuste} className="flex items-center justify-end gap-1">
                          <input className="w-16 rounded border border-stone-300 px-1 py-0.5 text-xs" type="number" placeholder="±" value={ajuste.cantidad} onChange={(e) => setAjuste({ ...ajuste, cantidad: e.target.value })} required />
                          <select className="rounded border border-stone-300 px-1 py-0.5 text-xs" value={ajuste.motivo} onChange={(e) => setAjuste({ ...ajuste, motivo: e.target.value })}>
                            <option value="compra">compra</option><option value="ajuste">ajuste</option><option value="merma">merma</option><option value="devolucion">devolución</option>
                          </select>
                          <Boton type="submit" className="px-2 py-1 text-xs">OK</Boton>
                          <Boton type="button" variante="fantasma" className="px-2 py-1 text-xs" onClick={() => setAjuste(null)}>✕</Boton>
                        </form>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Boton variante="secundario" className="px-2 py-1 text-xs" onClick={() => setAjuste({ id: p.id, cantidad: '', motivo: 'compra' })}>Stock</Boton>
                          <Boton variante="fantasma" className="px-2 py-1 text-xs" onClick={() => alternar(p, 'destacado')}>★</Boton>
                          <Boton variante="fantasma" className="px-2 py-1 text-xs" onClick={() => alternar(p, 'activo')}>{p.activo ? 'Ocultar' : 'Mostrar'}</Boton>
                        </div>
                      )}
                    </td>
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
