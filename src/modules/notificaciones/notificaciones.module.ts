import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from '../clientes/clientes.module';
import { Cliente } from '../clientes/entities/cliente.entity';
import { PedidosModule } from '../pedidos/pedidos.module';
import { Notificacion } from './entities/notificacion.entity';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { EmailService } from './proveedores/email.service';
import { PushFirebaseService } from './proveedores/push-firebase.service';
import { WhatsappService } from './proveedores/whatsapp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion, Cliente]), ClientesModule, PedidosModule],
  controllers: [NotificacionesController],
  providers: [NotificacionesService, PushFirebaseService, WhatsappService, EmailService],
  exports: [NotificacionesService, WhatsappService, PushFirebaseService],
})
export class NotificacionesModule {}
