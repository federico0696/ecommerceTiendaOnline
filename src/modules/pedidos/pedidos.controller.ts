import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser, ViveroActual } from '../../common/decorators';
import { Rol } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import {
  CambiarEstadoPagoDto,
  CambiarEstadoPedidoDto,
  CrearPedidoDto,
  FiltroPedidosDto,
} from './dto/pedido.dto';
import { PedidosService } from './pedidos.service';

/** Endpoints de la APP: el cliente opera sobre sus propios pedidos. */
@ApiTags('Pedidos (app)')
@Controller('mis-pedidos')
@Auth(Rol.CLIENTE)
export class MisPedidosController {
  constructor(private readonly service: PedidosService) {}

  @Post()
  @ApiOperation({ summary: 'Hacer un pedido' })
  crear(@GetUser() user: UsuarioAutenticado, @Body() dto: CrearPedidoDto) {
    return this.service.crear(user.viveroId as string, user.sub, dto);
  }

  @Get()
  listar(@GetUser('sub') clienteId: string, @Query() f: FiltroPedidosDto) {
    return this.service.listarDeCliente(clienteId, f);
  }

  @Get(':id')
  obtener(@GetUser('sub') clienteId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.obtenerDeCliente(clienteId, id);
  }

  @Patch(':id/cancelar')
  cancelar(@GetUser('sub') clienteId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.cancelarPorCliente(clienteId, id);
  }
}

/** Endpoints del PANEL. */
@ApiTags('Pedidos (gestión)')
@Controller('pedidos')
@Auth(Rol.ADMIN, Rol.EMPLEADO)
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  @Get()
  listar(@ViveroActual() viveroId: string, @Query() f: FiltroPedidosDto) {
    return this.service.listar(viveroId, f);
  }

  @Get('resumen')
  resumen(@ViveroActual() viveroId: string) {
    return this.service.resumen(viveroId);
  }

  @Get(':id')
  obtener(@ViveroActual() viveroId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.obtener(viveroId, id);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Avanzar o cancelar un pedido (respeta las transiciones permitidas)' })
  cambiarEstado(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoPedidoDto,
    @GetUser() user: UsuarioAutenticado,
  ) {
    return this.service.cambiarEstado(viveroId, id, dto, user.sub);
  }

  @Patch(':id/pago')
  cambiarPago(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoPagoDto,
  ) {
    return this.service.cambiarEstadoPago(viveroId, id, dto);
  }
}
