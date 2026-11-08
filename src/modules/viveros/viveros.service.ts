import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PaginacionDto, paginar } from '../../common/dto/paginacion.dto';
import { ActualizarViveroDto } from './dto/actualizar-vivero.dto';
import { CrearViveroDto } from './dto/crear-vivero.dto';
import {
  CONFIGURACION_VIVERO_DEFAULT,
  ConfiguracionVivero,
  Vivero,
} from './entities/vivero.entity';

@Injectable()
export class ViverosService {
  constructor(@InjectRepository(Vivero) private readonly repo: Repository<Vivero>) {}

  async crear(dto: CrearViveroDto): Promise<Vivero> {
    const existe = await this.repo.findOne({ where: { slug: dto.slug }, withDeleted: true });
    if (existe) throw new ConflictException(`Ya existe un vivero con el slug "${dto.slug}"`);
    const vivero = this.repo.create({ ...dto, configuracion: CONFIGURACION_VIVERO_DEFAULT });
    return this.repo.save(vivero);
  }

  async listar(dto: PaginacionDto) {
    const where = dto.buscar
      ? [{ nombre: ILike(`%${dto.buscar}%`) }, { ciudad: ILike(`%${dto.buscar}%`) }]
      : {};
    const [datos, total] = await this.repo.findAndCount({
      where,
      skip: dto.skip,
      take: dto.limite,
      order: { nombre: 'ASC' },
    });
    return paginar(datos, total, dto);
  }

  async obtener(id: string): Promise<Vivero> {
    const vivero = await this.repo.findOne({ where: { id } });
    if (!vivero) throw new NotFoundException('Vivero no encontrado');
    return vivero;
  }

  async obtenerPorSlug(slug: string): Promise<Vivero> {
    const vivero = await this.repo.findOne({ where: { slug, activo: true } });
    if (!vivero) throw new NotFoundException('Vivero no encontrado');
    return vivero;
  }

  /** Datos públicos que necesita la app o el widget antes de loguearse (marca, horarios, canales). */
  async perfilPublico(slug: string) {
    const v = await this.obtenerPorSlug(slug);
    return {
      id: v.id,
      nombre: v.nombre,
      slug: v.slug,
      telefono: v.telefono,
      direccion: v.direccion,
      ciudad: v.ciudad,
      latitud: v.latitud,
      longitud: v.longitud,
      marca: v.configuracion.marca,
      horarios: v.configuracion.horarios,
      nombreBot: v.configuracion.ia.nombreBot,
      canales: v.configuracion.canales,
      pedidos: v.configuracion.pedidos,
    };
  }

  async actualizar(id: string, dto: ActualizarViveroDto): Promise<Vivero> {
    const vivero = await this.obtener(id);
    const { configuracion, ...resto } = dto;
    Object.assign(vivero, resto);
    if (configuracion)
      vivero.configuracion = this.mergeConfiguracion(vivero.configuracion, configuracion);
    return this.repo.save(vivero);
  }

  async eliminar(id: string): Promise<void> {
    const vivero = await this.obtener(id);
    await this.repo.softRemove(vivero);
  }

  private mergeConfiguracion(
    actual: ConfiguracionVivero,
    cambios: Partial<ConfiguracionVivero>,
  ): ConfiguracionVivero {
    return {
      marca: { ...actual.marca, ...(cambios.marca ?? {}) },
      horarios: cambios.horarios ?? actual.horarios,
      ia: { ...actual.ia, ...(cambios.ia ?? {}) },
      canales: { ...actual.canales, ...(cambios.canales ?? {}) },
      pedidos: { ...actual.pedidos, ...(cambios.pedidos ?? {}) },
    };
  }
}
