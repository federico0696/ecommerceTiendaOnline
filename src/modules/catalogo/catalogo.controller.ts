import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser, ViveroActual } from '../../common/decorators';
import { PaginacionDto } from '../../common/dto/paginacion.dto';
import { Rol } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { ViverosService } from '../viveros/viveros.service';
import { CatalogoService } from './catalogo.service';
import { ActualizarCategoriaDto, CrearCategoriaDto } from './dto/categoria.dto';
import {
  ActualizarProductoDto,
  AgregarImagenDto,
  AjustarStockDto,
  CrearProductoDto,
  FiltroProductosDto,
} from './dto/producto.dto';

/**
 * Catálogo PÚBLICO: lo consume la app y el widget sin login, identificando el vivero por slug.
 */
@ApiTags('Catálogo público')
@Controller('publico/:vivero/catalogo')
export class CatalogoPublicoController {
  constructor(
    private readonly service: CatalogoService,
    private readonly viveros: ViverosService,
  ) {}

  @Get('categorias')
  async categorias(@Param('vivero') slug: string) {
    const v = await this.viveros.obtenerPorSlug(slug);
    return this.service.listarCategorias(v.id, true);
  }

  @Get('productos')
  async productos(@Param('vivero') slug: string, @Query() f: FiltroProductosDto) {
    const v = await this.viveros.obtenerPorSlug(slug);
    return this.service.buscarProductos(v.id, f, true);
  }

  @Get('productos/:slug')
  async producto(@Param('vivero') slug: string, @Param('slug') slugProducto: string) {
    const v = await this.viveros.obtenerPorSlug(slug);
    return this.service.obtenerProductoPorSlug(v.id, slugProducto);
  }
}

/**
 * Catálogo de GESTIÓN: panel (admin y empleados). Root opera con header x-vivero-id.
 */
@ApiTags('Catálogo (gestión)')
@Controller('catalogo')
@Auth(Rol.ADMIN, Rol.EMPLEADO)
export class CatalogoController {
  constructor(private readonly service: CatalogoService) {}

  // --- categorías ---
  @Post('categorias')
  crearCategoria(@ViveroActual() viveroId: string, @Body() dto: CrearCategoriaDto) {
    return this.service.crearCategoria(viveroId, dto);
  }

  @Get('categorias')
  listarCategorias(@ViveroActual() viveroId: string) {
    return this.service.listarCategorias(viveroId);
  }

  @Patch('categorias/:id')
  actualizarCategoria(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarCategoriaDto,
  ) {
    return this.service.actualizarCategoria(viveroId, id, dto);
  }

  @Delete('categorias/:id')
  eliminarCategoria(@ViveroActual() viveroId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.eliminarCategoria(viveroId, id);
  }

  // --- productos ---
  @Post('productos')
  crearProducto(@ViveroActual() viveroId: string, @Body() dto: CrearProductoDto) {
    return this.service.crearProducto(viveroId, dto);
  }

  @Get('productos')
  buscarProductos(@ViveroActual() viveroId: string, @Query() f: FiltroProductosDto) {
    return this.service.buscarProductos(viveroId, f, false);
  }

  @Get('productos/stock-bajo')
  @ApiOperation({ summary: 'Productos en o por debajo del stock mínimo' })
  stockBajo(@ViveroActual() viveroId: string) {
    return this.service.productosConStockBajo(viveroId);
  }

  @Get('productos/:id')
  obtenerProducto(@ViveroActual() viveroId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.obtenerProducto(viveroId, id);
  }

  @Patch('productos/:id')
  actualizarProducto(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarProductoDto,
  ) {
    return this.service.actualizarProducto(viveroId, id, dto);
  }

  @Delete('productos/:id')
  eliminarProducto(@ViveroActual() viveroId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.eliminarProducto(viveroId, id);
  }

  // --- stock ---
  @Post('productos/:id/stock')
  @ApiOperation({ summary: 'Ajuste manual de stock (compra, ajuste, merma, devolución)' })
  ajustarStock(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AjustarStockDto,
    @GetUser() user: UsuarioAutenticado,
  ) {
    return this.service.ajustarStock(viveroId, id, dto, user.sub);
  }

  @Get('productos/:id/stock/historial')
  historialStock(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() dto: PaginacionDto,
  ) {
    return this.service.historialStock(viveroId, id, dto);
  }

  // --- imágenes ---
  @Post('productos/:id/imagenes')
  agregarImagen(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AgregarImagenDto,
  ) {
    return this.service.agregarImagen(viveroId, id, dto);
  }

  @Delete('productos/:id/imagenes/:imagenId')
  quitarImagen(
    @ViveroActual() viveroId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imagenId', ParseUUIDPipe) imagenId: string,
  ) {
    return this.service.quitarImagen(viveroId, id, imagenId);
  }
}
