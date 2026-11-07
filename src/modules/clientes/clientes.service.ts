import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ILike, Repository } from 'typeorm';
import { PaginacionDto, paginar } from '../../common/dto/paginacion.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { RegistrarDispositivoDto } from './dto/registrar-dispositivo.dto';
import { Cliente } from './entities/cliente.entity';
import { DispositivoCliente } from './entities/dispositivo-cliente.entity';

export interface RegistroClienteInput {
  viveroId: string;
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
}

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente) private readonly repo: Repository<Cliente>,
    @InjectRepository(DispositivoCliente)
    private readonly dispositivos: Repository<DispositivoCliente>,
    private readonly config: ConfigService,
  ) {}

  async registrar(input: RegistroClienteInput): Promise<Cliente> {
    const email = input.email.toLowerCase();
    const existe = await this.repo.findOne({
      where: { viveroId: input.viveroId, email },
      withDeleted: true,
    });
    if (existe) throw new ConflictException('Ya existe una cuenta con ese email en este vivero');
    const cliente = this.repo.create({
      viveroId: input.viveroId,
      email,
      nombre: input.nombre,
      telefono: input.telefono ?? null,
      passwordHash: await bcrypt.hash(
        input.password,
        this.config.get<number>('auth.bcryptRounds') ?? 10,
      ),
    });
    const guardado = await this.repo.save(cliente);
    delete (guardado as Partial<Cliente>).passwordHash;
    return guardado;
  }

  buscarPorEmailConPassword(viveroId: string, email: string): Promise<Cliente | null> {
    return this.repo
      .createQueryBuilder('c')
      .addSelect('c.passwordHash')
      .where('c.vivero_id = :viveroId AND c.email = :email', {
        viveroId,
        email: email.toLowerCase(),
      })
      .getOne();
  }

  /** El canal WhatsApp identifica al cliente por su número; si no existe, lo crea "liviano" (sin password). */
  async obtenerOCrearPorWhatsapp(
    viveroId: string,
    whatsapp: string,
    nombre?: string,
  ): Promise<Cliente> {
    let cliente = await this.repo.findOne({ where: { viveroId, whatsapp } });
    if (cliente) return cliente;
    cliente = this.repo.create({
      viveroId,
      whatsapp,
      email: `${whatsapp}@whatsapp.local`,
      nombre: nombre ?? `Cliente ${whatsapp.slice(-4)}`,
      passwordHash: null,
    });
    return this.repo.save(cliente);
  }

  async obtener(id: string): Promise<Cliente> {
    const cliente = await this.repo.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async listar(viveroId: string, dto: PaginacionDto) {
    const base = { viveroId };
    const where = dto.buscar
      ? [
          { ...base, nombre: ILike(`%${dto.buscar}%`) },
          { ...base, email: ILike(`%${dto.buscar}%`) },
          { ...base, whatsapp: ILike(`%${dto.buscar}%`) },
        ]
      : base;
    const [datos, total] = await this.repo.findAndCount({
      where,
      skip: dto.skip,
      take: dto.limite,
      order: { creadoEn: 'DESC' },
    });
    return paginar(datos, total, dto);
  }

  async actualizarPerfil(id: string, dto: ActualizarPerfilDto): Promise<Cliente> {
    const cliente = await this.obtener(id);
    Object.assign(cliente, dto);
    return this.repo.save(cliente);
  }

  async registrarAcceso(id: string): Promise<void> {
    await this.repo.update(id, { ultimoAcceso: new Date() });
  }

  async registrarDispositivo(
    clienteId: string,
    dto: RegistrarDispositivoDto,
  ): Promise<DispositivoCliente> {
    // Si el token ya existía (otro usuario en el mismo teléfono), se reasigna.
    let dispositivo = await this.dispositivos.findOne({ where: { tokenFcm: dto.tokenFcm } });
    if (!dispositivo) dispositivo = this.dispositivos.create({ tokenFcm: dto.tokenFcm });
    Object.assign(dispositivo, {
      clienteId,
      plataforma: dto.plataforma ?? 'android',
      modelo: dto.modelo ?? null,
      versionApp: dto.versionApp ?? null,
      activo: true,
    });
    return this.dispositivos.save(dispositivo);
  }

  async quitarDispositivo(clienteId: string, tokenFcm: string): Promise<void> {
    await this.dispositivos.delete({ clienteId, tokenFcm });
  }

  tokensPush(clienteIds: string[]): Promise<DispositivoCliente[]> {
    if (clienteIds.length === 0) return Promise.resolve([]);
    return this.dispositivos
      .createQueryBuilder('d')
      .innerJoin('d.cliente', 'c')
      .where('d.cliente_id IN (:...ids) AND d.activo = true AND c.aceptaNotificaciones = true', {
        ids: clienteIds,
      })
      .getMany();
  }

  async desactivarToken(tokenFcm: string): Promise<void> {
    await this.dispositivos.update({ tokenFcm }, { activo: false });
  }
}
