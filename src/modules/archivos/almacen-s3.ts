import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { AlmacenArchivos, ArchivoSubido } from './almacen.interface';

export interface ConfigS3 {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  urlPublica: string;
}

export class AlmacenS3 implements AlmacenArchivos {
  private readonly cliente: S3Client;

  constructor(private readonly cfg: ConfigS3) {
    this.cliente = new S3Client({
      region: cfg.region,
      endpoint: cfg.endpoint,
      forcePathStyle: Boolean(cfg.endpoint),
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    });
  }

  async subir(
    buffer: Buffer,
    nombreOriginal: string,
    mime: string,
    carpeta: string,
  ): Promise<ArchivoSubido> {
    const clave = `${carpeta}/${randomUUID()}${extname(nombreOriginal).toLowerCase()}`;
    await this.cliente.send(
      new PutObjectCommand({
        Bucket: this.cfg.bucket,
        Key: clave,
        Body: buffer,
        ContentType: mime,
      }),
    );
    return { url: `${this.cfg.urlPublica}/${clave}`, clave, mime, tamano: buffer.length };
  }

  async eliminar(clave: string): Promise<void> {
    await this.cliente.send(new DeleteObjectCommand({ Bucket: this.cfg.bucket, Key: clave }));
  }
}
