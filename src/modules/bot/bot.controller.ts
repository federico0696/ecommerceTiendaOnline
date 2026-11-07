import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser, ViveroActual } from '../../common/decorators';
import { Canal, Rol } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { ClientesService } from '../clientes/clientes.service';
import { ConversacionesService } from '../conversaciones/conversaciones.service';
import { IaService } from '../ia/ia.service';
import { ViverosService } from '../viveros/viveros.service';
import { BotService } from './bot.service';
import { ProbarBotDto } from './dto/probar-bot.dto';
import { HERRAMIENTAS_BOT } from './herramientas/definiciones';

/** Endpoints del panel para administrar y probar el bot. El flujo real con clientes pasa por Canales. */
@ApiTags('Bot')
@Controller('bot')
@Auth(Rol.ADMIN)
export class BotController {
  constructor(
    private readonly bot: BotService,
    private readonly ia: IaService,
    private readonly viveros: ViverosService,
    private readonly clientes: ClientesService,
    private readonly conversaciones: ConversacionesService,
  ) {}

  @Get('herramientas')
  @ApiOperation({ summary: 'Herramientas que el bot tiene disponibles' })
  herramientas() {
    return HERRAMIENTAS_BOT.map((h) => ({ nombre: h.nombre, descripcion: h.descripcion }));
  }

  @Get('proveedores')
  @ApiOperation({ summary: 'Proveedores de IA con credenciales cargadas' })
  proveedores() {
    return { disponibles: this.ia.disponibles() };
  }

  @Post('probar')
  @ApiOperation({
    summary: 'Probar el bot desde el panel sin afectar conversaciones de clientes reales',
  })
  async probar(
    @ViveroActual() viveroId: string,
    @Body() dto: ProbarBotDto,
    @GetUser() user: UsuarioAutenticado,
  ) {
    const vivero = await this.viveros.obtener(viveroId);
    const cliente = dto.clienteId
      ? await this.clientes.obtener(dto.clienteId)
      : await this.clientes.obtenerOCrearPorWhatsapp(
          viveroId,
          `prueba-${user.sub.slice(0, 8)}`,
          `Prueba de ${user.nombre}`,
        );
    const conversacion = await this.conversaciones.obtenerOAbrir(viveroId, cliente.id, Canal.WEB);
    return this.bot.responder(vivero, cliente, conversacion, dto.mensaje);
  }
}
