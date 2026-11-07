export interface ArchivoSubido {
  url: string;
  clave: string;
  mime: string;
  tamano: number;
}

/** Abstracción del storage: hoy disco local o S3; mañana lo que haga falta. */
export interface AlmacenArchivos {
  subir(
    buffer: Buffer,
    nombreOriginal: string,
    mime: string,
    carpeta: string,
  ): Promise<ArchivoSubido>;
  eliminar(clave: string): Promise<void>;
}
