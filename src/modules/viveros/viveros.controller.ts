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
import { Auth, GetUser } from '../../common/decorators';
import { PaginacionDto } from '../../common/dto/paginacion.dto';
import { Rol } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { ActualizarViveroDto } from './dto/actualizar-vivero.dto';
import { CrearViveroDto } from './dto/crear-vivero.dto';
import { ViverosService } from './viveros.service';

@ApiTags('Viveros')
@Controller('viveros')
export class ViverosController {
  constructor(private readonly service: ViverosService) {}

  @Get('publico/:slug')
  @ApiOperation({
    summary: 'Perfil público de un vivero (lo usa la app antes del login y el widget web)',
  })
  perfilPublico(@Param('slug') slug: string) {
    return this.service.perfilPublico(slug);
  }

  @Post()
  @Auth(Rol.ROOT)
  @ApiOperation({ summary: 'Alta de un vivero (solo root)' })
  crear(@Body() dto: CrearViveroDto) {
    return this.service.crear(dto);
  }

  @Get()
  @Auth(Rol.ROOT)
  @ApiOperation({ summary: 'Listado de todos los viveros (solo root)' })
  listar(@Query() dto: PaginacionDto) {
    return this.service.listar(dto);
  }

  @Get('mio')
  @Auth(Rol.ADMIN, Rol.EMPLEADO)
  @ApiOperation({ summary: 'El vivero del usuario logueado' })
  mio(@GetUser() user: UsuarioAutenticado) {
    return this.service.obtener(user.viveroId as string);
  }

  @Get(':id')
  @Auth(Rol.ROOT)
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.obtener(id);
  }

  @Patch(':id')
  @Auth(Rol.ROOT, Rol.ADMIN)
  @ApiOperation({ summary: 'Actualizar datos y configuración. Un admin solo puede tocar el suyo.' })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarViveroDto,
    @GetUser() user: UsuarioAutenticado,
  ) {
    const objetivo = user.rol === Rol.ROOT ? id : (user.viveroId as string);
    return this.service.actualizar(objetivo, dto);
  }

  @Delete(':id')
  @Auth(Rol.ROOT)
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.eliminar(id);
  }
}
