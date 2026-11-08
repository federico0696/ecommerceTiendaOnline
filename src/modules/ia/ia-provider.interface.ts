/**
 * CONTRATO NEUTRO DE IA.
 *
 * Todo el sistema habla este formato. Cada proveedor (OpenAI, Anthropic, mock, el que venga)
 * traduce desde y hacia su propio API. Así:
 *  - el bot no sabe con qué modelo habla,
 *  - el historial guardado en la base no depende de ningún proveedor,
 *  - cada vivero puede elegir proveedor sin tocar código.
 */

export type NombreProveedor = 'mock' | 'openai' | 'anthropic';

/** Definición de una herramienta que el modelo puede invocar. `parametros` es JSON Schema. */
export interface HerramientaIA {
  nombre: string;
  descripcion: string;
  parametros: Record<string, unknown>;
}

export interface LlamadaHerramienta {
  id: string;
  nombre: string;
  argumentos: Record<string, unknown>;
}

export type MensajeIA =
  | { rol: 'usuario'; contenido: string }
  | { rol: 'asistente'; contenido: string | null; llamadas?: LlamadaHerramienta[] }
  | {
      rol: 'resultado_herramienta';
      idLlamada: string;
      nombre: string;
      contenido: string;
      esError?: boolean;
    };

export interface SolicitudIA {
  /** Instrucciones del sistema (prompt). */
  sistema: string;
  mensajes: MensajeIA[];
  herramientas?: HerramientaIA[];
  maxTokens?: number;
  /** Modelo puntual; si no se indica, el proveedor usa el de su configuración. */
  modelo?: string;
}

export type MotivoFin = 'fin' | 'herramientas' | 'longitud' | 'rechazo' | 'otro';

export interface RespuestaIA {
  texto: string | null;
  llamadas: LlamadaHerramienta[];
  motivoFin: MotivoFin;
  proveedor: NombreProveedor;
  modelo: string;
  uso?: { tokensEntrada: number; tokensSalida: number };
}

export interface ProveedorIA {
  readonly nombre: NombreProveedor;
  /** true si tiene credenciales cargadas y puede usarse. */
  disponible(): boolean;
  generar(solicitud: SolicitudIA): Promise<RespuestaIA>;
}
