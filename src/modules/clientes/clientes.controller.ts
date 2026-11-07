import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser, ViveroActual } from '../../common/decorators';
import { PaginacionDto } from '../../common/dto/paginacion.dto';
import { Rol } from '../../common/enums';
import { ClientesService } from './clientes.service';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { RegistrarDispositivoDto } from './dto/registrar-dispositivo.dto';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  // ----- Endpoints para la APP (el propio cliente) -----

  @Get('yo')
  @Auth(Rol.CLIENTE)
  @ApiOperation({ summary: 'Perfil del cliente logueado' })
  yo(@GetUser('sub') id: string) {
    return this.service.obtener(id);
  }

  @Patch('yo')
  @Auth(Rol.CLIENTE)
  actualizarYo(@GetUser('sub') id: string, @Body() dto: ActualizarPerfilDto) {
    return this.service.actualizarPerfil(id, dto);
  }

  @Post('yo/dispositivos')
  @Auth(Rol.CLIENTE)
  @ApiOperation({ summary: 'Registrar token de push (Firebase) del dispositivo' })
  registrarDispositivo(@GetUser('sub') id: string, @Body() dto: RegistrarDispositivoDto) {
    return this.service.registrarDispositivo(id, dto);
  }

  @Delete('yo/dispositivos/:token')
  @Auth(Rol.CLIENTE)
  quitarDispositivo(@GetUser('sub') id: string, @Param('token') token: string) {
    return this.service.quitarDispositivo(id, token);
  }

  // ----- Endpoints para el PANEL -----

  @Get()
  @Auth(Rol.ADMIN, Rol.EMPLEADO)
  @ApiOperation({ summary: 'Clientes del vivero' })
  listar(@ViveroActual() viveroId: string, @Query() dto: PaginacionDto) {
    return this.service.listar(viveroId, dto);
  }

  @Get(':id')
  @Auth(Rol.ADMIN, Rol.EMPLEADO)
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.obtener(id);
  }
}
