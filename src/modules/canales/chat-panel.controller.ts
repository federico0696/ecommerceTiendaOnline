import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser, ViveroActual } from '../../common/decorators';
import { PaginacionDto } from '../../common/dto/paginacion.dto';
import { Rol } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { ConversacionesService } from '../conversaciones/conversaciones.service';
import {
  AsignarConversacionDto,
  EnviarMensajeDto,
  FiltroConversacionesDto,
} from '../conversaciones/dto/conversaciones.dto';
import { CanalesService } from './canales.service';

/** Bandeja de conversaciones del PANEL: ver, tomar, responder, devolver al bot, cerrar. */
@ApiTags('Conversaciones (panel)')
@Controller('conversaciones')
@Auth(Rol.ADMIN, Rol.EMPLEADO)
export class ChatPanelController {
  constructor(
    private readonly conversaciones: ConversacionesService,
    private readonly canales: CanalesService,
  ) {}

  @Get()
  listar(@ViveroActual() viveroId: string, @Query() f: FiltroConversacionesDto) {
    return this.conversaciones.listar(viveroId, f);
  }

  @Get('resumen')
  resumen(@ViveroActual() viveroId: string) {
    return this.conversaciones.resumen(viveroId);
  }

  @Get(':id')
  async obtener(@ViveroActual() viveroId: string, @Param('id', ParseUUIDPipe) id: string) {
    const c = await this.conversaciones.obtener(viveroId, id);
    await this.conversaciones.marcarLeidosPanel(c);
    return c;
  }

  @Get(':id/mensajes')
  async mensajes(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() dto: PaginacionDto,
  ) {
    await this.conversaciones.obtener(viveroId, id);
    return this.conversaciones.listarMensajes(id, dto);
  }

  @Post(':id/mensajes')
  @ApiOperation({ summary: 'Responder como empleado (toma la conversación si estaba en el bot)' })
  responder(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnviarMensajeDto,
    @GetUser() user: UsuarioAutenticado,
  ) {
    return this.canales.responderDesdePanel(viveroId, id, user.sub, dto.contenido);
  }

  @Patch(':id/asignar')
  async asignar(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AsignarConversacionDto,
    @GetUser() user: UsuarioAutenticado,
  ) {
    const c = await this.conversaciones.obtener(viveroId, id);
    return this.conversaciones.asignar(c, dto.usuarioId ?? user.sub, 'Asignada desde el panel');
  }

  @Patch(':id/devolver-al-bot')
  devolverAlBot(@ViveroActual() viveroId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.canales.devolverAlBot(viveroId, id);
  }

  @Patch(':id/cerrar')
  async cerrar(@ViveroActual() viveroId: string, @Param('id', ParseUUIDPipe) id: string) {
    const c = await this.conversaciones.obtener(viveroId, id);
    return this.conversaciones.cerrar(c);
  }
}
