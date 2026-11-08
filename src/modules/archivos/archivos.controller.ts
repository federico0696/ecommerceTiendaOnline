import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, ViveroActual } from '../../common/decorators';
import { Rol } from '../../common/enums';
import { ArchivosService } from './archivos.service';

@ApiTags('Archivos')
@Controller('archivos')
@Auth(Rol.ADMIN, Rol.EMPLEADO)
export class ArchivosController {
  constructor(private readonly service: ArchivosService) {}

  @Post('imagenes')
  @UseInterceptors(FileInterceptor('archivo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { archivo: { type: 'string', format: 'binary' } } },
  })
  @ApiOperation({ summary: 'Subir una imagen (devuelve url y clave para asociarla a un producto)' })
  subirImagen(@ViveroActual() viveroId: string, @UploadedFile() archivo: Express.Multer.File) {
    return this.service.subirImagen(viveroId, archivo);
  }
}
