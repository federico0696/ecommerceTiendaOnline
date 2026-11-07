import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViverosModule } from '../viveros/viveros.module';
import { CatalogoController, CatalogoPublicoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { Categoria } from './entities/categoria.entity';
import { ImagenProducto } from './entities/imagen-producto.entity';
import { MovimientoStock } from './entities/movimiento-stock.entity';
import { Producto } from './entities/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria, Producto, ImagenProducto, MovimientoStock]),
    ViverosModule,
  ],
  controllers: [CatalogoPublicoController, CatalogoController],
  providers: [CatalogoService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
