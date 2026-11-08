import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Rol } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { ClientesService } from '../clientes/clientes.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ViverosService } from '../viveros/viveros.service';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { LoginDto } from './dto/login.dto';
import { RegistroClienteDto } from './dto/registro-cliente.dto';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiraEn: string;
}

interface PayloadRefresh extends UsuarioAutenticado {
  versionToken: number;
  tipoToken: 'refresh';
}

/**
 * Dos "puertas" de entrada con el mismo formato de token:
 * - loginPanel: usuarios (root/admin/empleado)
 * - loginCliente / registrarCliente: clientes de la app, siempre dentro de un vivero
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly clientes: ClientesService,
    private readonly viveros: ViverosService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async loginPanel(dto: LoginDto) {
    const usuario = await this.usuarios.buscarPorEmailConPassword(dto.email);
    if (!usuario || !usuario.activo) throw new UnauthorizedException('Credenciales inválidas');
    const ok = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    await this.usuarios.registrarAcceso(usuario.id);

    const payload: UsuarioAutenticado = {
      sub: usuario.id,
      tipo: 'usuario',
      rol: usuario.rol,
      viveroId: usuario.viveroId,
      email: usuario.email,
      nombre: usuario.nombre,
    };
    return { usuario: payload, ...this.emitirTokens(payload, usuario.versionToken) };
  }

  async registrarCliente(dto: RegistroClienteDto) {
    const vivero = await this.viveros.obtenerPorSlug(dto.vivero);
    const cliente = await this.clientes.registrar({ viveroId: vivero.id, ...dto });
    const payload = this.payloadCliente(cliente.id, vivero.id, cliente.email, cliente.nombre);
    return { cliente: payload, ...this.emitirTokens(payload, cliente.versionToken) };
  }

  async loginCliente(dto: LoginClienteDto) {
    const vivero = await this.viveros.obtenerPorSlug(dto.vivero);
    const cliente = await this.clientes.buscarPorEmailConPassword(vivero.id, dto.email);
    if (!cliente || !cliente.activo || !cliente.passwordHash)
      throw new UnauthorizedException('Credenciales inválidas');
    const ok = await bcrypt.compare(dto.password, cliente.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    await this.clientes.registrarAcceso(cliente.id);
    const payload = this.payloadCliente(cliente.id, vivero.id, cliente.email, cliente.nombre);
    return { cliente: payload, ...this.emitirTokens(payload, cliente.versionToken) };
  }

  async refrescar(refreshToken: string): Promise<Tokens> {
    let payload: PayloadRefresh;
    try {
      payload = this.jwt.verify<PayloadRefresh>(refreshToken, {
        secret: this.config.get('auth.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o vencido');
    }
    if (payload.tipoToken !== 'refresh') throw new UnauthorizedException('Token incorrecto');

    // Se verifica que la cuenta siga activa y que no se haya invalidado la sesión.
    const versionActual =
      payload.tipo === 'usuario'
        ? await this.usuarios.obtener(payload.sub).then((u) => (u.activo ? u.versionToken : -1))
        : await this.clientes.obtener(payload.sub).then((c) => (c.activo ? c.versionToken : -1));
    if (versionActual !== payload.versionToken)
      throw new UnauthorizedException('La sesión fue cerrada');

    const { versionToken, tipoToken, ...base } = payload;
    void tipoToken;
    delete (base as any).iat;
    delete (base as any).exp;
    return this.emitirTokens(base, versionToken);
  }

  private payloadCliente(
    id: string,
    viveroId: string,
    email: string,
    nombre: string,
  ): UsuarioAutenticado {
    return { sub: id, tipo: 'cliente', rol: Rol.CLIENTE, viveroId, email, nombre };
  }

  private emitirTokens(payload: UsuarioAutenticado, versionToken: number): Tokens {
    const expiraEn = this.config.get<string>('auth.jwtExpiracion') ?? '8h';
    const accessToken = this.jwt.sign(payload, { expiresIn: expiraEn });
    const refreshToken = this.jwt.sign(
      { ...payload, versionToken, tipoToken: 'refresh' },
      {
        secret: this.config.get('auth.refreshSecret'),
        expiresIn: this.config.get('auth.refreshExpiracion') ?? '30d',
      },
    );
    return { accessToken, refreshToken, expiraEn };
  }
}
