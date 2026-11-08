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
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from '../../common/decorators';
import { PaginacionDto } from '../../common/dto/paginacion.dto';
import { Rol } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuarios del panel')
@Controller('usuarios')
@Auth(Rol.ADMIN)
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Alta de admin o empleado' })
  crear(@Body() dto: CrearUsuarioDto, @GetUser() actor: UsuarioAutenticado) {
    return this.service.crear(dto, actor);
  }

  @Get()
  @ApiQuery({ name: 'viveroId', required: false, description: 'Solo root: filtrar por vivero' })
  listar(
    @Query() dto: PaginacionDto,
    @GetUser() actor: UsuarioAutenticado,
    @Query('viveroId') viveroId?: string,
  ) {
    return this.service.listar(dto, actor, viveroId);
  }

  @Get(':id')
  obtener(@Param('id', ParseUUIDPipe) id: string, @GetUser() actor: UsuarioAutenticado) {
    return this.service.obtener(id, actor);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarUsuarioDto,
    @GetUser() actor: UsuarioAutenticado,
  ) {
    return this.service.actualizar(id, dto, actor);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string, @GetUser() actor: UsuarioAutenticado) {
    return this.service.eliminar(id, actor);
  }
}
