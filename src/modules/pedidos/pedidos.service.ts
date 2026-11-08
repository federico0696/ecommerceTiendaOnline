import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { paginar } from '../../common/dto/paginacion.dto';
import { CatalogoService } from '../catalogo/catalogo.service';
import { ViverosService } from '../viveros/viveros.service';
import { EventosPedidos } from './pedidos.eventos';
import {
  CambiarEstadoPagoDto,
  CambiarEstadoPedidoDto,
  CrearPedidoDto,
  FiltroPedidosDto,
} from './dto/pedido.dto';
import { ItemPedido } from './entities/item-pedido.entity';
import { EstadoPedido, Pedido, TipoEntrega, TRANSICIONES_PEDIDO } from './entities/pedido.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido) private readonly repo: Repository<Pedido>,
    private readonly catalogo: CatalogoService,
    private readonly viveros: ViverosService,
    private readonly eventos: EventosPedidos,
    private readonly dataSource: DataSource,
  ) {}

  /** Alta desde la app. Valida stock, calcula totales y descuenta stock en transacción. */
  async crear(viveroId: string, clienteId: string, dto: CrearPedidoDto): Promise<Pedido> {
    const vivero = await this.viveros.obtener(viveroId);
    const cfg = vivero.configuracion.pedidos;
    if (dto.tipoEntrega === TipoEntrega.ENVIO && !cfg.permiteEnvio)
      throw new BadRequestException('Este vivero no hace envíos');
    if (dto.tipoEntrega === TipoEntrega.RETIRO && !cfg.permiteRetiro)
      throw new BadRequestException('Este vivero no permite retiro');
    if (dto.tipoEntrega === TipoEntrega.ENVIO && !dto.direccionEntrega)
      throw new BadRequestException('Falta la dirección de entrega');

    // Un mismo producto repetido se consolida.
    const consolidado = new Map<string, number>();
    for (const it of dto.items)
      consolidado.set(it.productoId, (consolidado.get(it.productoId) ?? 0) + it.cantidad);

    const items: ItemPedido[] = [];
    let subtotal = 0;
    for (const [productoId, cantidad] of consolidado) {
      const p = await this.catalogo.obtenerProducto(viveroId, productoId);
      if (!p.activo) throw new BadRequestException(`"${p.nombre}" ya no está disponible`);
      const precio = Number(p.precioOferta ?? p.precio);
      const item = new ItemPedido();
      Object.assign(item, {
        productoId,
        nombreProducto: p.nombre,
        cantidad,
        precioUnitario: precio,
        subtotal: precio * cantidad,
      });
      items.push(item);
      subtotal += item.subtotal;
    }
    const costoEnvio = dto.tipoEntrega === TipoEntrega.ENVIO ? Number(cfg.costoEnvioBase) : 0;

    const pedido = this.repo.create({
      viveroId,
      clienteId,
      numero: await this.siguienteNumero(viveroId),
      tipoEntrega: dto.tipoEntrega,
      direccionEntrega: dto.direccionEntrega ?? null,
      notaCliente: dto.notaCliente ?? null,
      subtotal,
      costoEnvio,
      total: subtotal + costoEnvio,
      items,
      historialEstados: [
        { estado: EstadoPedido.PENDIENTE, fecha: new Date().toISOString(), usuarioId: null },
      ],
    });
    // Pedido y descuento de stock en UNA transacción: o entra todo o no entra nada.
    const guardado = await this.dataSource.transaction(async (manager) => {
      const p = await manager.save(pedido);
      await this.catalogo.descontarPorPedido(
        manager,
        viveroId,
        items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
        p.id,
      );
      return p;
    });
    this.eventos.pedidoCreado(guardado);
    return guardado;
  }

  async listar(viveroId: string, f: FiltroPedidosDto) {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.items', 'i')
      .leftJoinAndSelect('p.cliente', 'c')
      .where('p.vivero_id = :viveroId', { viveroId });
    if (f.estado) qb.andWhere('p.estado = :estado', { estado: f.estado });
    if (f.clienteId) qb.andWhere('p.cliente_id = :clienteId', { clienteId: f.clienteId });
    if (f.buscar)
      qb.andWhere('(CAST(p.numero AS TEXT) ILIKE :q OR c.nombre ILIKE :q)', { q: `%${f.buscar}%` });
    qb.orderBy('p.creadoEn', 'DESC').skip(f.skip).take(f.limite);
    const [datos, total] = await qb.getManyAndCount();
    return paginar(datos, total, f);
  }

  async listarDeCliente(clienteId: string, f: FiltroPedidosDto) {
    const [datos, total] = await this.repo.findAndCount({
      where: { clienteId, ...(f.estado ? { estado: f.estado } : {}) },
      order: { creadoEn: 'DESC' },
      skip: f.skip,
      take: f.limite,
    });
    return paginar(datos, total, f);
  }

  async obtener(viveroId: string, id: string): Promise<Pedido> {
    const p = await this.repo.findOne({ where: { id, viveroId }, relations: { cliente: true } });
    if (!p) throw new NotFoundException('Pedido no encontrado');
    return p;
  }

  async obtenerDeCliente(clienteId: string, id: string): Promise<Pedido> {
    const p = await this.repo.findOne({ where: { id, clienteId } });
    if (!p) throw new NotFoundException('Pedido no encontrado');
    return p;
  }

  async cambiarEstado(
    viveroId: string,
    id: string,
    dto: CambiarEstadoPedidoDto,
    usuarioId: string | null,
  ): Promise<Pedido> {
    const pedido = await this.obtener(viveroId, id);
    const permitidas = TRANSICIONES_PEDIDO[pedido.estado];
    if (!permitidas.includes(dto.estado)) {
      throw new BadRequestException(`No se puede pasar de "${pedido.estado}" a "${dto.estado}"`);
    }
    const anterior = pedido.estado;
    pedido.estado = dto.estado;
    if (dto.notaInterna !== undefined) pedido.notaInterna = dto.notaInterna;
    pedido.historialEstados = [
      ...pedido.historialEstados,
      { estado: dto.estado, fecha: new Date().toISOString(), usuarioId, motivo: dto.motivo },
    ];
    const guardado = await this.repo.save(pedido);

    if (dto.estado === EstadoPedido.CANCELADO) {
      await this.catalogo.reponerPorCancelacion(
        viveroId,
        pedido.items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
        pedido.id,
      );
    }
    this.eventos.estadoCambiado(guardado, anterior);
    return guardado;
  }

  /** El cliente solo puede cancelar mientras esté pendiente. */
  async cancelarPorCliente(clienteId: string, id: string): Promise<Pedido> {
    const pedido = await this.obtenerDeCliente(clienteId, id);
    if (pedido.estado !== EstadoPedido.PENDIENTE)
      throw new ForbiddenException(
        'El pedido ya fue tomado por el vivero; contactalos por el chat',
      );
    return this.cambiarEstado(
      pedido.viveroId,
      id,
      { estado: EstadoPedido.CANCELADO, motivo: 'Cancelado por el cliente' },
      null,
    );
  }

  async cambiarEstadoPago(
    viveroId: string,
    id: string,
    dto: CambiarEstadoPagoDto,
  ): Promise<Pedido> {
    const pedido = await this.obtener(viveroId, id);
    pedido.estadoPago = dto.estadoPago;
    if (dto.referenciaPago !== undefined) pedido.referenciaPago = dto.referenciaPago;
    return this.repo.save(pedido);
  }

  /** Resumen rápido para la pantalla de inicio del panel. */
  async resumen(viveroId: string) {
    const filas = await this.repo
      .createQueryBuilder('p')
      .select('p.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .where('p.vivero_id = :viveroId', { viveroId })
      .groupBy('p.estado')
      .getRawMany<{ estado: EstadoPedido; cantidad: string }>();
    const porEstado = Object.fromEntries(Object.values(EstadoPedido).map((e) => [e, 0])) as Record<
      EstadoPedido,
      number
    >;
    for (const f of filas) porEstado[f.estado] = Number(f.cantidad);
    return { porEstado };
  }

  private async siguienteNumero(viveroId: string): Promise<number> {
    const { max } = (await this.repo
      .createQueryBuilder('p')
      .select('COALESCE(MAX(p.numero), 0)', 'max')
      .where('p.vivero_id = :viveroId', { viveroId })
      .withDeleted()
      .getRawOne<{ max: string }>()) ?? { max: '0' };
    return Number(max) + 1;
  }
}
