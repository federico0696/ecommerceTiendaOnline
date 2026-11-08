import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlmacenLocal } from './almacen-local';
import { AlmacenS3, ConfigS3 } from './almacen-s3';
import { AlmacenArchivos, ArchivoSubido } from './almacen.interface';

const MIMES_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 8 * 1024 * 1024;

@Injectable()
export class ArchivosService {
  private readonly logger = new Logger(ArchivosService.name);
  private readonly almacen: AlmacenArchivos;

  constructor(config: ConfigService) {
    const proveedor = config.get<'local' | 's3'>('archivos.proveedor');
    const urlPublica = config.get<string>('archivos.urlPublica') as string;
    if (proveedor === 's3') {
      this.almacen = new AlmacenS3({
        ...(config.get('archivos.s3') as Omit<ConfigS3, 'urlPublica'>),
        urlPublica,
      });
    } else {
      this.almacen = new AlmacenLocal(
        config.get<string>('archivos.localRuta') as string,
        urlPublica,
      );
    }
    this.logger.log(`Almacén de archivos: ${proveedor}`);
  }

  subirImagen(
    viveroId: string,
    archivo: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ): Promise<ArchivoSubido> {
    if (!MIMES_IMAGEN.includes(archivo.mimetype))
      throw new BadRequestException('Solo se aceptan imágenes JPG, PNG, WEBP o GIF');
    if (archivo.size > MAX_BYTES) throw new BadRequestException('La imagen no puede superar 8 MB');
    return this.almacen.subir(
      archivo.buffer,
      archivo.originalname,
      archivo.mimetype,
      `viveros/${viveroId}/imagenes`,
    );
  }

  eliminar(clave: string): Promise<void> {
    return this.almacen.eliminar(clave);
  }
}
