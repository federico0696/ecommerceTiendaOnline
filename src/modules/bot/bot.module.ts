import { Module } from '@nestjs/common';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { ClientesModule } from '../clientes/clientes.module';
import { ConversacionesModule } from '../conversaciones/conversaciones.module';
import { PedidosModule } from '../pedidos/pedidos.module';
import { ViverosModule } from '../viveros/viveros.module';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';

@Module({
  imports: [ConversacionesModule, CatalogoModule, PedidosModule, ClientesModule, ViverosModule],
  controllers: [BotController],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
