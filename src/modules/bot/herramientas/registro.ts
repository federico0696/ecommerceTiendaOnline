import { FiltroProductosDto } from '../../catalogo/dto/producto.dto';
import { TipoProducto } from '../../catalogo/entities/producto.entity';
import { FiltroPedidosDto } from '../../pedidos/dto/pedido.dto';
import { ContextoHerramienta, ResultadoHerramienta } from './contexto';

type Ejecutor = (
  args: Record<string, any>,
  ctx: ContextoHerramienta,
) => Promise<ResultadoHerramienta>;

const resumirProducto = (p: any) => ({
  id: p.id,
  nombre: p.nombre,
  nombreCientifico: p.nombreCientifico,
  tipo: p.tipo,
  categoria: p.categoria?.nombre ?? null,
  precio: Number(p.precioOferta ?? p.precio),
  precioLista: Number(p.precio),
  enOferta: p.precioOferta != null,
  stock: p.stock,
  cuidados: {
    luz: p.cuidados?.luz,
    riego: p.cuidados?.riego,
    ubicacion: p.cuidados?.ubicacion,
    dificultad: p.cuidados?.dificultad,
    toxicaMascotas: p.cuidados?.toxicaMascotas,
  },
  imagen: p.imagenes?.find((i: any) => i.principal)?.url ?? p.imagenes?.[0]?.url ?? null,
});

/** Nombre de herramienta -> función que la ejecuta. */
export const EJECUTORES: Record<string, Ejecutor> = {
  async buscar_productos(args, ctx) {
    const filtro = Object.assign(new FiltroProductosDto(), {
      buscar: args.consulta,
      tipo: args.tipo as TipoProducto | undefined,
      luz: args.luz,
      ubicacion: args.ubicacion,
      soloConStock: args.solo_con_stock ?? false,
      limite: 8,
      pagina: 1,
    });
    const res = await ctx.servicios.catalogo.buscarProductos(ctx.vivero.id, filtro, true);
    return { datos: { total: res.total, productos: res.datos.map(resumirProducto) } };
  },

  async detalle_producto(args, ctx) {
    const p = await ctx.servicios.catalogo.obtenerProducto(ctx.vivero.id, String(args.producto_id));
    if (!p.activo) return { datos: { error: 'Ese producto ya no está disponible' }, esError: true };
    return {
      datos: {
        ...resumirProducto(p),
        descripcion: p.descripcion,
        cuidadosCompletos: p.cuidados,
        etiquetas: p.etiquetas,
        imagenes: p.imagenes?.map((i) => i.url),
      },
    };
  },

  async mis_pedidos(_args, ctx) {
    const filtro = Object.assign(new FiltroPedidosDto(), { pagina: 1, limite: 5 });
    const res = await ctx.servicios.pedidos.listarDeCliente(ctx.cliente.id, filtro);
    return {
      datos: res.datos.map((p) => ({
        numero: p.numero,
        estado: p.estado,
        total: Number(p.total),
        fecha: p.creadoEn,
        tipoEntrega: p.tipoEntrega,
        items: p.items.map((i) => `${i.cantidad}x ${i.nombreProducto}`),
      })),
    };
  },

  async estado_pedido(args, ctx) {
    const filtro = Object.assign(new FiltroPedidosDto(), { pagina: 1, limite: 50 });
    const res = await ctx.servicios.pedidos.listarDeCliente(ctx.cliente.id, filtro);
    const p = res.datos.find((x) => x.numero === Number(args.numero));
    if (!p)
      return {
        datos: { error: `No encontré un pedido #${args.numero} a tu nombre` },
        esError: true,
      };
    return {
      datos: {
        numero: p.numero,
        estado: p.estado,
        estadoPago: p.estadoPago,
        tipoEntrega: p.tipoEntrega,
        direccionEntrega: p.direccionEntrega,
        total: Number(p.total),
        fecha: p.creadoEn,
        items: p.items.map((i) => ({
          producto: i.nombreProducto,
          cantidad: i.cantidad,
          subtotal: Number(i.subtotal),
        })),
        historial: p.historialEstados,
      },
    };
  },

  async info_vivero(_args, ctx) {
    const v = ctx.vivero;
    return {
      datos: {
        nombre: v.nombre,
        horarios: v.configuracion.horarios,
        direccion: v.direccion,
        ciudad: v.ciudad,
        telefono: v.telefono,
        email: v.email,
        entrega: v.configuracion.pedidos,
      },
    };
  },

  async derivar_a_humano(args, ctx) {
    const motivo = String(args.motivo ?? 'El cliente pidió hablar con una persona');
    await ctx.servicios.conversaciones.derivarAHumano(ctx.conversacion, motivo);
    return {
      datos: { derivado: true },
      derivar: {
        motivo,
        mensajeAlCliente: `Perfecto, ya le aviso a una persona del vivero para que siga la charla con vos. Te responden a la brevedad dentro del horario de atención (${ctx.vivero.configuracion.horarios}).`,
      },
    };
  },
};
