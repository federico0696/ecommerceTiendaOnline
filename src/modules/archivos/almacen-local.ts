import { promises as fs } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { AlmacenArchivos, ArchivoSubido } from './almacen.interface';

export class AlmacenLocal implements AlmacenArchivos {
  constructor(
    private readonly ruta: string,
    private readonly urlPublica: string,
  ) {}

  async subir(
    buffer: Buffer,
    nombreOriginal: string,
    mime: string,
    carpeta: string,
  ): Promise<ArchivoSubido> {
    const clave = `${carpeta}/${randomUUID()}${extname(nombreOriginal).toLowerCase()}`;
    const destino = join(this.ruta, clave);
    await fs.mkdir(join(this.ruta, carpeta), { recursive: true });
    await fs.writeFile(destino, buffer);
    return { url: `${this.urlPublica}/${clave}`, clave, mime, tamano: buffer.length };
  }

  async eliminar(clave: string): Promise<void> {
    await fs.rm(join(this.ruta, clave), { force: true });
  }
}
