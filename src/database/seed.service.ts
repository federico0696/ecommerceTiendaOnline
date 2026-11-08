import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsuariosService } from '../modules/usuarios/usuarios.service';

/** Al arrancar garantiza que exista el usuario root (con los datos de ROOT_EMAIL / ROOT_PASSWORD). */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usuarios: UsuariosService) {}

  async onApplicationBootstrap() {
    try {
      await this.usuarios.crearRootSiNoExiste();
      this.logger.log('Usuario root verificado');
    } catch (e) {
      this.logger.error(`No se pudo verificar el root: ${(e as Error).message}`);
    }
  }
}
