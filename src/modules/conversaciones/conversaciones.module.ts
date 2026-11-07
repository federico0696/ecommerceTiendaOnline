import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversacionesService } from './conversaciones.service';
import { Conversacion } from './entities/conversacion.entity';
import { Mensaje } from './entities/mensaje.entity';

/** Solo persistencia. Los controladores viven en Canales, que orquesta el flujo completo. */
@Module({
  imports: [TypeOrmModule.forFeature([Conversacion, Mensaje])],
  providers: [ConversacionesService],
  exports: [ConversacionesService, TypeOrmModule],
})
export class ConversacionesModule {}
