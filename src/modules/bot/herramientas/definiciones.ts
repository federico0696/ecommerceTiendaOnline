import { HerramientaIA } from '../../ia/ia-provider.interface';

/**
 * Esquemas de las herramientas que ve el modelo. Son JSON Schema puro y neutro:
 * cada proveedor los traduce a su formato. Si agregás una herramienta acá,
 * agregá su ejecutor en registro.ts.
 */
export const HERRAMIENTAS_BOT: HerramientaIA[] = [
  {
    nombre: 'buscar_productos',
    descripcion:
      'Busca plantas, flores, macetas e insumos en el catálogo del vivero por texto libre y filtros. Devuelve nombre, precio, stock, categoría y ficha de cuidados resumida. Usala siempre que el cliente pregunte por un producto, un precio o si hay stock.',
    parametros: {
      type: 'object',
      properties: {
        consulta: {
          type: 'string',
          description:
            'Texto a buscar: nombre común, científico o característica (ej: "monstera", "colgante", "poca luz").',
        },
        tipo: {
          type: 'string',
          enum: [
            'planta',
            'flor',
            'semilla',
            'maceta',
            'sustrato',
            'herramienta',
            'insumo',
            'otro',
          ],
          description: 'Tipo de producto, si el cliente lo aclara.',
        },
        luz: {
          type: 'string',
          enum: ['sombra', 'media-sombra', 'sol-indirecto', 'pleno-sol'],
          description: 'Luz disponible en el lugar del cliente.',
        },
        ubicacion: { type: 'string', enum: ['interior', 'exterior'] },
        solo_con_stock: {
          type: 'boolean',
          description: 'true para mostrar solo lo que hay disponible ahora.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    nombre: 'detalle_producto',
    descripcion:
      'Trae la ficha completa de un producto (descripción, cuidados detallados, precio, stock, imágenes) a partir de su id. Usala cuando el cliente quiera saber más de un producto puntual que ya apareció en una búsqueda.',
    parametros: {
      type: 'object',
      properties: {
        producto_id: {
          type: 'string',
          description: 'id del producto devuelto por buscar_productos',
        },
      },
      required: ['producto_id'],
      additionalProperties: false,
    },
  },
  {
    nombre: 'mis_pedidos',
    descripcion:
      'Lista los últimos pedidos del cliente con número, estado, total y fecha. Usala cuando pregunte por "mi pedido" sin dar número.',
    parametros: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    nombre: 'estado_pedido',
    descripcion: 'Devuelve el detalle y estado de un pedido del cliente por su número (ej: 1042).',
    parametros: {
      type: 'object',
      properties: {
        numero: { type: 'integer', description: 'Número del pedido tal como lo ve el cliente' },
      },
      required: ['numero'],
      additionalProperties: false,
    },
  },
  {
    nombre: 'info_vivero',
    descripcion: 'Horarios, dirección, teléfono, formas de entrega y costo de envío del vivero.',
    parametros: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    nombre: 'derivar_a_humano',
    descripcion:
      'Pasa la conversación a un empleado del vivero. Usala si el cliente lo pide, si está molesto, si hay un reclamo o un cambio sobre un pedido ya confirmado, si pregunta por pagos, o si no podés resolver lo que necesita.',
    parametros: {
      type: 'object',
      properties: {
        motivo: {
          type: 'string',
          description: 'Resumen de una línea de por qué se deriva y qué necesita el cliente.',
        },
      },
      required: ['motivo'],
      additionalProperties: false,
    },
  },
];
