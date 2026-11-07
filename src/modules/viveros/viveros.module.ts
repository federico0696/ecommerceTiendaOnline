import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vivero } from './entities/vivero.entity';
import { ViverosController } from './viveros.controller';
import { ViverosService } from './viveros.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vivero])],
  controllers: [ViverosController],
  providers: [ViverosService],
  exports: [ViverosService],
})
export class ViverosModule {}
