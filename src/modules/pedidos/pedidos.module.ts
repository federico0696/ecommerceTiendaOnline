import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { ViverosModule } from '../viveros/viveros.module';
import { ItemPedido } from './entities/item-pedido.entity';
import { Pedido } from './entities/pedido.entity';
import { MisPedidosController, PedidosController } from './pedidos.controller';
import { EventosPedidos } from './pedidos.eventos';
import { PedidosService } from './pedidos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, ItemPedido]), CatalogoModule, ViverosModule],
  controllers: [MisPedidosController, PedidosController],
  providers: [PedidosService, EventosPedidos],
  exports: [PedidosService, EventosPedidos],
})
export class PedidosModule {}
