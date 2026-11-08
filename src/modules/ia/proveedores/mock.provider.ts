import { Injectable } from '@nestjs/common';
import { ProveedorIA, RespuestaIA, SolicitudIA } from '../ia-provider.interface';

const STOP = new Set([
  'hola',
  'tenés',
  'tenes',
  'tienen',
  'alguna',
  'algún',
  'algun',
  'quiero',
  'busco',
  'precio',
  'para',
  'tiene',
  'cuánto',
  'cuanto',
  'sale',
  'cuesta',
  'vale',
  'estoy',
  'buscando',
  'necesito',
  'venden',
  'unas',
  'unos',
  'esta',
  'este',
]);
const DISPARADORES_BUSQUEDA = [
  'tenés',
  'tenes',
  'tienen',
  'hay',
  'busco',
  'quiero',
  'precio',
  'planta',
  'maceta',
  'flor',
  'suculenta',
  'cactus',
  'cuánto',
  'cuanto',
];

/**
 * Proveedor de prueba. No llama a nada externo.
 * Sirve para demos sin claves, tests y para desarrollar el flujo de herramientas:
 * reconoce pedidos de hablar con una persona, búsquedas de productos, y convierte
 * el resultado de una herramienta en texto. Es deliberadamente simple.
 */
@Injectable()
export class MockProvider implements ProveedorIA {
  readonly nombre = 'mock' as const;

  disponible() {
    return true;
  }

  async generar(s: SolicitudIA): Promise<RespuestaIA> {
    const ultimo = s.mensajes[s.mensajes.length - 1];
    const base = {
      proveedor: this.nombre,
      modelo: 'mock-1',
      uso: { tokensEntrada: 0, tokensSalida: 0 },
    };

    if (ultimo?.rol === 'resultado_herramienta') {
      return {
        ...base,
        texto: this.textoDesdeResultado(ultimo.nombre, ultimo.contenido),
        llamadas: [],
        motivoFin: 'fin',
      };
    }

    const texto = ultimo?.rol === 'usuario' ? ultimo.contenido.toLowerCase() : '';
    const tiene = (nombre: string) => s.herramientas?.some((h) => h.nombre === nombre);
    const llamada = (nombre: string, argumentos: Record<string, unknown>): RespuestaIA => ({
      ...base,
      texto: null,
      llamadas: [{ id: `mock_${Date.now()}`, nombre, argumentos }],
      motivoFin: 'herramientas',
    });

    if (
      tiene('derivar_a_humano') &&
      /(humano|persona|operador|empleado|alguien|reclamo)/.test(texto)
    ) {
      return llamada('derivar_a_humano', { motivo: 'El cliente pidió hablar con una persona' });
    }
    const numeroPedido = /pedido\s*#?\s*(\d+)/.exec(texto);
    if (tiene('estado_pedido') && numeroPedido) {
      return llamada('estado_pedido', { numero: Number(numeroPedido[1]) });
    }
    if (tiene('mis_pedidos') && /mi pedido|mis pedidos/.test(texto)) {
      return llamada('mis_pedidos', {});
    }
    if (
      tiene('info_vivero') &&
      /(horario|dirección|direccion|dónde|donde|teléfono|telefono|envío|envio)/.test(texto)
    ) {
      return llamada('info_vivero', {});
    }
    if (tiene('buscar_productos') && DISPARADORES_BUSQUEDA.some((p) => texto.includes(p))) {
      const palabras = texto
        .replace(/[^a-záéíóúñü\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP.has(w));
      return llamada('buscar_productos', { consulta: palabras[palabras.length - 1] ?? texto });
    }
    return {
      ...base,
      texto:
        '¡Hola! Soy el asistente del vivero (modo demo, sin IA real). Puedo buscar plantas y productos, contarte cómo cuidarlos, ver tus pedidos o pasarte con una persona del vivero. ¿Qué necesitás?',
      llamadas: [],
      motivoFin: 'fin',
    };
  }

  private textoDesdeResultado(herramienta: string, contenido: string): string {
    let data: any;
    try {
      data = JSON.parse(contenido);
    } catch {
      return contenido.slice(0, 500);
    }
    if (data?.error) return `${data.error}. ¿Querés que te pase con una persona del vivero?`;
    switch (herramienta) {
      case 'buscar_productos': {
        const lista: any[] = data.productos ?? [];
        if (!lista.length)
          return 'No encontré nada con ese nombre en el catálogo. ¿Probamos con otra palabra, o te paso con una persona del vivero?';
        return `Encontré esto en el vivero:\n${lista
          .slice(0, 5)
          .map(
            (p) =>
              `• ${p.nombre} - $${p.precio}${p.stock > 0 ? ` (hay ${p.stock})` : ' (sin stock)'}`,
          )
          .join('\n')}\n\n¿Querés que te cuente cómo cuidar alguna?`;
      }
      case 'estado_pedido':
        return `Tu pedido #${data.numero} está "${data.estado}". Total: $${data.total}.`;
      case 'mis_pedidos':
        return Array.isArray(data) && data.length
          ? `Tus últimos pedidos:\n${data.map((p: any) => `• #${p.numero}: ${p.estado} ($${p.total})`).join('\n')}`
          : 'Todavía no tenés pedidos.';
      case 'info_vivero':
        return `${data.nombre}. Horarios: ${data.horarios}. ${data.direccion ? `Estamos en ${data.direccion}${data.ciudad ? `, ${data.ciudad}` : ''}.` : ''}`;
      default:
        return contenido.slice(0, 500);
    }
  }
}
