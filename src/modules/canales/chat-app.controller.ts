import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from '../../common/decorators';
import { PaginacionDto } from '../../common/dto/paginacion.dto';
import { Canal, Rol } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { ClientesService } from '../clientes/clientes.service';
import { ConversacionesService } from '../conversaciones/conversaciones.service';
import { CanalesService } from './canales.service';
import { MensajeAppDto } from './dto/canales.dto';

/**
 * CANAL APP (y también lo usa el widget web, que se loguea igual que un cliente).
 * El cliente manda un mensaje y recibe la respuesta en la misma llamada, además de por socket.
 */
@ApiTags('Chat (app)')
@Controller('chat')
@Auth(Rol.CLIENTE)
export class ChatAppController {
  constructor(
    private readonly canales: CanalesService,
    private readonly conversaciones: ConversacionesService,
    private readonly clientes: ClientesService,
  ) {}

  @Post('mensajes')
  @ApiOperation({
    summary:
      'Enviar un mensaje. Devuelve el mensaje guardado y la respuesta (del bot, o null si espera un humano).',
  })
  async enviar(@GetUser() user: UsuarioAutenticado, @Body() dto: MensajeAppDto) {
    const cliente = await this.clientes.obtener(user.sub);
    const canal = (user as any).canal === 'web' ? Canal.WEB : Canal.APP;
    const r = await this.canales.procesarEntrante({
      viveroId: user.viveroId as string,
      canal,
      cliente,
      texto: dto.texto,
      tipo: dto.tipo,
      metadata: dto.metadata,
    });
    return {
      conversacionId: r.conversacion.id,
      modo: r.conversacion.modo,
      mensaje: r.mensajeCliente,
      respuesta: r.respuesta,
    };
  }

  @Get('conversacion')
  @ApiOperation({ summary: 'Conversación activa del cliente en la app (la crea si no existe)' })
  async conversacion(@GetUser() user: UsuarioAutenticado) {
    const c = await this.conversaciones.obtenerOAbrir(user.viveroId as string, user.sub, Canal.APP);
    await this.conversaciones.marcarLeidosCliente(c);
    return c;
  }

  @Get('conversaciones/:id/mensajes')
  async mensajes(
    @GetUser('sub') clienteId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() dto: PaginacionDto,
  ) {
    await this.conversaciones.obtenerDeCliente(clienteId, id);
    return this.conversaciones.listarMensajes(id, dto);
  }
}
