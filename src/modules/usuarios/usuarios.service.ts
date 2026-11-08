import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ILike, Repository } from 'typeorm';
import { PaginacionDto, paginar } from '../../common/dto/paginacion.dto';
import { Rol } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private readonly repo: Repository<Usuario>,
    private readonly config: ConfigService,
  ) {}

  /** Alta hecha por root (cualquier vivero) o por un admin (solo su vivero, solo empleados y admins). */
  async crear(dto: CrearUsuarioDto, actor: UsuarioAutenticado): Promise<Usuario> {
    if (dto.rol === Rol.ROOT || dto.rol === Rol.CLIENTE) {
      throw new ForbiddenException('Ese rol no se asigna por este endpoint');
    }
    const viveroId = actor.rol === Rol.ROOT ? dto.viveroId : actor.viveroId;
    if (!viveroId) throw new ForbiddenException('Hay que indicar el vivero del usuario');

    const existe = await this.repo.findOne({
      where: { email: dto.email.toLowerCase() },
      withDeleted: true,
    });
    if (existe) throw new ConflictException('Ya existe un usuario con ese email');

    const usuario = this.repo.create({
      email: dto.email.toLowerCase(),
      nombre: dto.nombre,
      rol: dto.rol,
      telefono: dto.telefono ?? null,
      viveroId,
      passwordHash: await this.hashear(dto.password),
    });
    return this.limpiar(await this.repo.save(usuario));
  }

  async crearRootSiNoExiste(): Promise<void> {
    const root = this.config.get('auth.root');
    const existe = await this.repo.findOne({ where: { rol: Rol.ROOT } });
    if (existe) return;
    await this.repo.save(
      this.repo.create({
        email: root.email.toLowerCase(),
        nombre: root.nombre,
        rol: Rol.ROOT,
        viveroId: null,
        passwordHash: await this.hashear(root.password),
      }),
    );
  }

  async listar(dto: PaginacionDto, actor: UsuarioAutenticado, viveroId?: string) {
    const filtroVivero =
      actor.rol === Rol.ROOT
        ? viveroId
          ? { viveroId }
          : {}
        : { viveroId: actor.viveroId as string };
    const where = dto.buscar
      ? [
          { ...filtroVivero, nombre: ILike(`%${dto.buscar}%`) },
          { ...filtroVivero, email: ILike(`%${dto.buscar}%`) },
        ]
      : filtroVivero;
    const [datos, total] = await this.repo.findAndCount({
      where,
      skip: dto.skip,
      take: dto.limite,
      order: { nombre: 'ASC' },
    });
    return paginar(datos, total, dto);
  }

  async obtener(id: string, actor?: UsuarioAutenticado): Promise<Usuario> {
    const usuario = await this.repo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (actor && actor.rol !== Rol.ROOT && usuario.viveroId !== actor.viveroId) {
      throw new ForbiddenException('Ese usuario no pertenece a tu vivero');
    }
    return usuario;
  }

  /** Incluye el hash: solo lo usa auth. */
  buscarPorEmailConPassword(email: string): Promise<Usuario | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async actualizar(
    id: string,
    dto: ActualizarUsuarioDto,
    actor: UsuarioAutenticado,
  ): Promise<Usuario> {
    const usuario = await this.obtener(id, actor);
    if (usuario.rol === Rol.ROOT && actor.rol !== Rol.ROOT)
      throw new ForbiddenException('No podés modificar al root');
    if (dto.rol && (dto.rol === Rol.ROOT || dto.rol === Rol.CLIENTE))
      throw new ForbiddenException('Rol no permitido');
    if (actor.rol !== Rol.ROOT) delete dto.viveroId;
    if (dto.email) dto.email = dto.email.toLowerCase();
    Object.assign(usuario, dto);
    if (dto.activo === false) usuario.versionToken += 1;
    return this.limpiar(await this.repo.save(usuario));
  }

  async cambiarPassword(id: string, nueva: string): Promise<void> {
    const usuario = await this.obtener(id);
    usuario.passwordHash = await this.hashear(nueva);
    usuario.versionToken += 1;
    await this.repo.save(usuario);
  }

  async registrarAcceso(id: string): Promise<void> {
    await this.repo.update(id, { ultimoAcceso: new Date() });
  }

  async eliminar(id: string, actor: UsuarioAutenticado): Promise<void> {
    const usuario = await this.obtener(id, actor);
    if (usuario.rol === Rol.ROOT) throw new ForbiddenException('El root no se elimina');
    await this.repo.softRemove(usuario);
  }

  private hashear(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.get<number>('auth.bcryptRounds') ?? 10);
  }

  private limpiar(u: Usuario): Usuario {
    delete (u as Partial<Usuario>).passwordHash;
    return u;
  }
}
