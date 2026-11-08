import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { viverosApi } from '../../api/servicios';
import { mensajeError } from '../../api/cliente';
import { Boton, Campo, Tarjeta, Titulo } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import type { Vivero } from '../../interfaces';

/** Datos del vivero y configuración que ve el cliente (marca, horarios, entregas, canales). */
export const ConfiguracionPage = () => {
  const { viveroActualId } = useAuth();
  const [v, setV] = useState<Vivero | null>(null);

  useEffect(() => {
    if (!viveroActualId) return;
    viverosApi.obtener(viveroActualId).catch(() => viverosApi.mio()).then(setV).catch(() => undefined);
  }, [viveroActualId]);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (!v) return;
    try {
      const { id, nombre, email, telefono, direccion, ciudad, provincia, configuracion } = v;
      const actualizado = await viverosApi.actualizar(id, { nombre, email, telefono, direccion, ciudad, provincia, configuracion: { marca: configuracion.marca, horarios: configuracion.horarios, pedidos: configuracion.pedidos, canales: configuracion.canales } });
      setV(actualizado);
      toast.success('Guardado');
    } catch (err) { toast.error(mensajeError(err)); }
  };

  if (!v) return null;
  const cfg = v.configuracion;
  const setCfg = (parte: Partial<Vivero['configuracion']>) => setV({ ...v, configuracion: { ...cfg, ...parte } });

  return (
    <>
      <Titulo sub="Lo que la app muestra de tu vivero: datos, colores, horarios y formas de entrega.">Mi vivero</Titulo>
      <form onSubmit={guardar} className="grid gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Datos">
          <div className="space-y-2">
            <Campo etiqueta="Nombre" value={v.nombre} onChange={(e) => setV({ ...v, nombre: e.target.value })} required />
            <Campo etiqueta="Slug (identificador en la app y la web)" value={v.slug} disabled />
            <Campo etiqueta="Email" type="email" value={v.email ?? ''} onChange={(e) => setV({ ...v, email: e.target.value })} />
            <Campo etiqueta="Teléfono" value={v.telefono ?? ''} onChange={(e) => setV({ ...v, telefono: e.target.value })} />
            <Campo etiqueta="Dirección" value={v.direccion ?? ''} onChange={(e) => setV({ ...v, direccion: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Campo etiqueta="Ciudad" value={v.ciudad ?? ''} onChange={(e) => setV({ ...v, ciudad: e.target.value })} />
              <Campo etiqueta="Provincia" value={v.provincia ?? ''} onChange={(e) => setV({ ...v, provincia: e.target.value })} />
            </div>
            <Campo etiqueta="Horarios" value={cfg.horarios} onChange={(e) => setCfg({ horarios: e.target.value })} />
          </div>
        </Tarjeta>
        <div className="space-y-4">
          <Tarjeta titulo="Marca (colores de la app)">
            <div className="grid grid-cols-2 gap-2">
              <Campo etiqueta="Color primario" type="color" value={cfg.marca.colorPrimario} onChange={(e) => setCfg({ marca: { ...cfg.marca, colorPrimario: e.target.value } })} />
              <Campo etiqueta="Color secundario" type="color" value={cfg.marca.colorSecundario} onChange={(e) => setCfg({ marca: { ...cfg.marca, colorSecundario: e.target.value } })} />
            </div>
            <Campo etiqueta="URL del logo" className="mt-2" value={cfg.marca.logoUrl ?? ''} onChange={(e) => setCfg({ marca: { ...cfg.marca, logoUrl: e.target.value || null } })} />
          </Tarjeta>
          <Tarjeta titulo="Entregas">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.pedidos.permiteRetiro} onChange={(e) => setCfg({ pedidos: { ...cfg.pedidos, permiteRetiro: e.target.checked } })} /> Retiro en el vivero</label>
            <label className="mt-1 flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.pedidos.permiteEnvio} onChange={(e) => setCfg({ pedidos: { ...cfg.pedidos, permiteEnvio: e.target.checked } })} /> Envío a domicilio</label>
            <Campo etiqueta="Costo base de envío" type="number" min={0} className="mt-2" value={cfg.pedidos.costoEnvioBase} onChange={(e) => setCfg({ pedidos: { ...cfg.pedidos, costoEnvioBase: Number(e.target.value) } })} />
          </Tarjeta>
          <Tarjeta titulo="Canales">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.canales.appHabilitada} onChange={(e) => setCfg({ canales: { ...cfg.canales, appHabilitada: e.target.checked } })} /> App mobile</label>
            <label className="mt-1 flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.canales.webHabilitada} onChange={(e) => setCfg({ canales: { ...cfg.canales, webHabilitada: e.target.checked } })} /> Chat web (widget)</label>
            <label className="mt-1 flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.canales.whatsappHabilitado} onChange={(e) => setCfg({ canales: { ...cfg.canales, whatsappHabilitado: e.target.checked } })} /> WhatsApp</label>
            <Campo etiqueta="Phone Number ID de WhatsApp (Meta)" className="mt-2" value={cfg.canales.whatsappPhoneNumberId ?? ''} onChange={(e) => setCfg({ canales: { ...cfg.canales, whatsappPhoneNumberId: e.target.value || null } })} />
          </Tarjeta>
          <Boton type="submit" className="w-full">Guardar cambios</Boton>
        </div>
      </form>
    </>
  );
};
