import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Repository } from 'typeorm';
import { PaginacionDto, paginar } from '../../common/dto/paginacion.dto';
import { slugify } from '../../common/utils/slug';
import { ActualizarCategoriaDto, CrearCategoriaDto } from './dto/categoria.dto';
import {
  ActualizarProductoDto,
  AgregarImagenDto,
  AjustarStockDto,
  CrearProductoDto,
  FiltroProductosDto,
} from './dto/producto.dto';
import { Categoria } from './entities/categoria.entity';
import { ImagenProducto } from './entities/imagen-producto.entity';
import { MotivoMovimiento, MovimientoStock } from './entities/movimiento-stock.entity';
import { FICHA_CUIDADO_VACIA, Producto } from './entities/producto.entity';

@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(Categoria) private readonly categorias: Repository<Categoria>,
    @InjectRepository(Producto) private readonly productos: Repository<Producto>,
    @InjectRepository(ImagenProducto) private readonly imagenes: Repository<ImagenProducto>,
    @InjectRepository(MovimientoStock) private readonly movimientos: Repository<MovimientoStock>,
  ) {}

  // ================= CATEGORÍAS =================

  async crearCategoria(viveroId: string, dto: CrearCategoriaDto): Promise<Categoria> {
    const slug = dto.slug ?? slugify(dto.nombre);
    if (await this.categorias.findOne({ where: { viveroId, slug }, withDeleted: true })) {
      throw new ConflictException(`Ya existe una categoría "${slug}"`);
    }
    return this.categorias.save(this.categorias.create({ ...dto, slug, viveroId }));
  }

  listarCategorias(viveroId: string, soloActivas = false): Promise<Categoria[]> {
    return this.categorias.find({
      where: soloActivas ? { viveroId, activa: true } : { viveroId },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async obtenerCategoria(viveroId: string, id: string): Promise<Categoria> {
    const c = await this.categorias.findOne({ where: { id, viveroId } });
    if (!c) throw new NotFoundException('Categoría no encontrada');
    return c;
  }

  async actualizarCategoria(
    viveroId: string,
    id: string,
    dto: ActualizarCategoriaDto,
  ): Promise<Categoria> {
    const c = await this.obtenerCategoria(viveroId, id);
    Object.assign(c, dto);
    return this.categorias.save(c);
  }

  async eliminarCategoria(viveroId: string, id: string): Promise<void> {
    await this.categorias.softRemove(await this.obtenerCategoria(viveroId, id));
  }

  // ================= PRODUCTOS =================

  async crearProducto(viveroId: string, dto: CrearProductoDto): Promise<Producto> {
    const slug = dto.slug ?? slugify(dto.nombre);
    if (await this.productos.findOne({ where: { viveroId, slug }, withDeleted: true })) {
      throw new ConflictException(`Ya existe un producto "${slug}"`);
    }
    if (dto.categoriaId) await this.obtenerCategoria(viveroId, dto.categoriaId);
    const producto = this.productos.create({
      ...dto,
      slug,
      viveroId,
      cuidados: { ...FICHA_CUIDADO_VACIA, ...(dto.cuidados ?? {}) },
      imagenes: [],
    });
    const guardado = await this.productos.save(producto);
    if ((dto.stock ?? 0) > 0) {
      await this.movimientos.save(
        this.movimientos.create({
          viveroId,
          productoId: guardado.id,
          cantidad: dto.stock as number,
          stockResultante: dto.stock as number,
          motivo: MotivoMovimiento.AJUSTE,
          observacion: 'Stock inicial',
          usuarioId: null,
          pedidoId: null,
        }),
      );
    }
    return guardado;
  }

  /**
   * Búsqueda con filtros. `publico=true` es lo que ve la app: solo activos.
   * Busca por nombre, nombre científico, descripción y etiquetas.
   */
  async buscarProductos(viveroId: string, f: FiltroProductosDto, publico = false) {
    const qb = this.productos
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.imagenes', 'img')
      .leftJoinAndSelect('p.categoria', 'cat')
      .where('p.vivero_id = :viveroId', { viveroId });

    if (publico) qb.andWhere('p.activo = true');
    if (f.categoriaId) qb.andWhere('p.categoria_id = :categoriaId', { categoriaId: f.categoriaId });
    if (f.tipo) qb.andWhere('p.tipo = :tipo', { tipo: f.tipo });
    if (f.luz) qb.andWhere(`p.cuidados->>'luz' = :luz`, { luz: f.luz });
    if (f.ubicacion)
      qb.andWhere(`p.cuidados->>'ubicacion' IN (:...ubic)`, { ubic: [f.ubicacion, 'ambos'] });
    if (f.soloConStock) qb.andWhere('p.stock > 0');
    if (f.destacados) qb.andWhere('p.destacado = true');
    if (f.buscar) {
      const q = `%${f.buscar}%`;
      qb.andWhere(
        new Brackets((b) =>
          b
            .where('p.nombre ILIKE :q', { q })
            .orWhere('p.nombreCientifico ILIKE :q', { q })
            .orWhere('p.descripcion ILIKE :q', { q })
            .orWhere(`array_to_string(p.etiquetas, ' ') ILIKE :q`, { q }),
        ),
      );
    }

    qb.orderBy('p.destacado', 'DESC').addOrderBy('p.nombre', 'ASC').skip(f.skip).take(f.limite);
    const [datos, total] = await qb.getManyAndCount();
    return paginar(datos, total, f);
  }

  async obtenerProducto(viveroId: string, id: string): Promise<Producto> {
    const p = await this.productos.findOne({
      where: { id, viveroId },
      relations: { categoria: true },
    });
    if (!p) throw new NotFoundException('Producto no encontrado');
    return p;
  }

  async obtenerProductoPorSlug(viveroId: string, slug: string): Promise<Producto> {
    const p = await this.productos.findOne({
      where: { slug, viveroId, activo: true },
      relations: { categoria: true },
    });
    if (!p) throw new NotFoundException('Producto no encontrado');
    return p;
  }

  async actualizarProducto(
    viveroId: string,
    id: string,
    dto: ActualizarProductoDto,
  ): Promise<Producto> {
    const p = await this.obtenerProducto(viveroId, id);
    const { cuidados, stock, ...resto } = dto;
    if (stock !== undefined)
      throw new BadRequestException('El stock se cambia con el endpoint de ajuste de stock');
    if (resto.categoriaId) await this.obtenerCategoria(viveroId, resto.categoriaId);
    Object.assign(p, resto);
    if (cuidados) p.cuidados = { ...p.cuidados, ...cuidados };
    return this.productos.save(p);
  }

  async eliminarProducto(viveroId: string, id: string): Promise<void> {
    await this.productos.softRemove(await this.obtenerProducto(viveroId, id));
  }

  // ================= STOCK =================

  /** Ajuste manual desde el panel. Para ventas se usa descontarPorPedido. */
  async ajustarStock(
    viveroId: string,
    productoId: string,
    dto: AjustarStockDto,
    usuarioId: string | null,
  ) {
    return this.moverStock(viveroId, productoId, dto.cantidad, dto.motivo as MotivoMovimiento, {
      observacion: dto.observacion,
      usuarioId,
    });
  }

  /**
   * Lo llama Pedidos al confirmar, DENTRO de su misma transacción (recibe el manager).
   * El descuento es atómico: UPDATE ... WHERE stock >= cantidad. Si no afecta filas, no alcanzaba.
   */
  async descontarPorPedido(
    manager: EntityManager,
    viveroId: string,
    items: { productoId: string; cantidad: number }[],
    pedidoId: string,
  ) {
    for (const item of items) {
      const resultado = await manager
        .createQueryBuilder()
        .update(Producto)
        .set({ stock: () => 'stock - :cantidad' })
        .where('id = :id AND vivero_id = :viveroId AND stock >= :cantidad', {
          id: item.productoId,
          viveroId,
          cantidad: item.cantidad,
        })
        .returning(['stock', 'nombre'])
        .execute();
      if (!resultado.affected) {
        const p = await manager.findOne(Producto, { where: { id: item.productoId, viveroId } });
        if (!p) throw new NotFoundException(`Producto ${item.productoId} no encontrado`);
        throw new BadRequestException(`Stock insuficiente para "${p.nombre}" (hay ${p.stock})`);
      }
      const fila = resultado.raw[0] as { stock: number; nombre: string };
      await manager.save(
        manager.create(MovimientoStock, {
          viveroId,
          productoId: item.productoId,
          cantidad: -item.cantidad,
          stockResultante: fila.stock,
          motivo: MotivoMovimiento.VENTA,
          observacion: null,
          usuarioId: null,
          pedidoId,
        }),
      );
    }
  }

  async reponerPorCancelacion(
    viveroId: string,
    items: { productoId: string; cantidad: number }[],
    pedidoId: string,
  ) {
    for (const item of items) {
      await this.moverStock(viveroId, item.productoId, item.cantidad, MotivoMovimiento.DEVOLUCION, {
        pedidoId,
        observacion: 'Pedido cancelado',
      });
    }
  }

  historialStock(viveroId: string, productoId: string, dto: PaginacionDto) {
    return this.movimientos
      .findAndCount({
        where: { viveroId, productoId },
        order: { creadoEn: 'DESC' },
        skip: dto.skip,
        take: dto.limite,
      })
      .then(([datos, total]) => paginar(datos, total, dto));
  }

  productosConStockBajo(viveroId: string): Promise<Producto[]> {
    return this.productos
      .createQueryBuilder('p')
      .where('p.vivero_id = :viveroId AND p.activo = true AND p.stock <= p.stockMinimo', {
        viveroId,
      })
      .orderBy('p.stock', 'ASC')
      .getMany();
  }

  private async moverStock(
    viveroId: string,
    productoId: string,
    cantidad: number,
    motivo: MotivoMovimiento,
    extra: { observacion?: string | null; usuarioId?: string | null; pedidoId?: string | null },
  ) {
    if (cantidad === 0) throw new BadRequestException('La cantidad no puede ser cero');
    const p = await this.obtenerProducto(viveroId, productoId);
    if (p.stock + cantidad < 0)
      throw new BadRequestException(`El stock no puede quedar negativo (hay ${p.stock})`);
    p.stock += cantidad;
    await this.productos.save(p);
    const mov = await this.movimientos.save(
      this.movimientos.create({
        viveroId,
        productoId,
        cantidad,
        stockResultante: p.stock,
        motivo,
        observacion: extra.observacion ?? null,
        usuarioId: extra.usuarioId ?? null,
        pedidoId: extra.pedidoId ?? null,
      }),
    );
    return { producto: p, movimiento: mov };
  }

  // ================= IMÁGENES =================

  async agregarImagen(
    viveroId: string,
    productoId: string,
    dto: AgregarImagenDto,
  ): Promise<ImagenProducto> {
    const p = await this.obtenerProducto(viveroId, productoId);
    if (dto.principal) await this.imagenes.update({ productoId }, { principal: false });
    const orden = p.imagenes?.length ?? 0;
    return this.imagenes.save(
      this.imagenes.create({
        productoId,
        url: dto.url,
        clave: dto.clave ?? null,
        principal: dto.principal ?? orden === 0,
        orden,
      }),
    );
  }

  async quitarImagen(
    viveroId: string,
    productoId: string,
    imagenId: string,
  ): Promise<ImagenProducto> {
    await this.obtenerProducto(viveroId, productoId);
    const img = await this.imagenes.findOne({ where: { id: imagenId, productoId } });
    if (!img) throw new NotFoundException('Imagen no encontrada');
    await this.imagenes.remove(img);
    return img;
  }
}
