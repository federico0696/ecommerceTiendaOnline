import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { IaService } from '../ia/ia.service';

@ApiTags('Salud')
@Controller('salud')
export class SaludController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly ia: IaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Estado del servicio: base de datos, IA, integraciones' })
  async estado() {
    let db = 'ok';
    try {
      await this.dataSource.query('SELECT 1');
    } catch (e) {
      db = `error: ${(e as Error).message}`;
    }
    return {
      ok: db === 'ok',
      nombre: this.config.get('app.nombre'),
      entorno: this.config.get('app.env'),
      version: process.env.npm_package_version ?? '0.1.0',
      fecha: new Date().toISOString(),
      db,
      ia: { global: this.config.get('ia.proveedor'), disponibles: this.ia.disponibles() },
      integraciones: {
        firebase: this.config.get('firebase.habilitado'),
        whatsapp: this.config.get('whatsapp.habilitado'),
        mail: this.config.get('mail.habilitado'),
        archivos: this.config.get('archivos.proveedor'),
      },
    };
  }
}
