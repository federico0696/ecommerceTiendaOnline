import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { Cliente } from './entities/cliente.entity';
import { DispositivoCliente } from './entities/dispositivo-cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, DispositivoCliente])],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
