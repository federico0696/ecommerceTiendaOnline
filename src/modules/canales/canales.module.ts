import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from '../bot/bot.module';
import { ClientesModule } from '../clientes/clientes.module';
import { ConversacionesModule } from '../conversaciones/conversaciones.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { Vivero } from '../viveros/entities/vivero.entity';
import { ViverosModule } from '../viveros/viveros.module';
import { CanalesService } from './canales.service';
import { ChatAppController } from './chat-app.controller';
import { ChatPanelController } from './chat-panel.controller';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vivero]),
    ConversacionesModule,
    BotModule,
    ClientesModule,
    ViverosModule,
    NotificacionesModule,
  ],
  controllers: [ChatAppController, ChatPanelController, WhatsappWebhookController],
  providers: [CanalesService],
  exports: [CanalesService],
})
export class CanalesModule {}
