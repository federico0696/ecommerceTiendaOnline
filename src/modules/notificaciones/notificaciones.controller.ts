import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser, ViveroActual } from '../../common/decorators';
import { PaginacionDto } from '../../common/dto/paginacion.dto';
import { Rol } from '../../common/enums';
import { EnviarNotificacionDto } from './dto/enviar-notificacion.dto';
import { NotificacionesService } from './notificaciones.service';

@ApiTags('Notificaciones')
@Controller('notificaciones')
@Auth(Rol.ADMIN, Rol.EMPLEADO)
export class NotificacionesController {
  constructor(private readonly service: NotificacionesService) {}

  @Post('enviar')
  @ApiOperation({
    summary: 'Enviar push, WhatsApp o email a clientes puntuales o a todos (campaña)',
  })
  enviar(
    @ViveroActual() viveroId: string,
    @Body() dto: EnviarNotificacionDto,
    @GetUser('sub') usuarioId: string,
  ) {
    return this.service.enviarDesdePanel(viveroId, dto, usuarioId);
  }

  @Get()
  historial(@ViveroActual() viveroId: string, @Query() dto: PaginacionDto) {
    return this.service.historial(viveroId, dto);
  }
}
