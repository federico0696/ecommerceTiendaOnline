import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginacionDto, paginar } from '../../common/dto/paginacion.dto';
import { Canal } from '../../common/enums';
import { MensajeIA } from '../ia/ia-provider.interface';
import { FiltroConversacionesDto } from './dto/conversaciones.dto';
import { Conversacion, EstadoConversacion, ModoConversacion } from './entities/conversacion.entity';
import { EmisorMensaje, Mensaje, TipoMensaje } from './entities/mensaje.entity';

export interface NuevoMensaje {
  emisor: EmisorMensaje;
  emisorId?: string | null;
  contenido: string;
  tipo?: TipoMensaje;
  metadata?: Record<string, unknown>;
}

/** Persistencia de conversaciones y mensajes. La lógica de "quién responde" está en Canales. */
@Injectable()
export class ConversacionesService {
  constructor(
    @InjectRepository(Conversacion) private readonly conversaciones: Repository<Conversacion>,
    @InjectRepository(Mensaje) private readonly mensajes: Repository<Mensaje>,
    private readonly config: ConfigService,
  ) {}

  /** Devuelve la conversación abierta del cliente en ese canal, o crea una nueva en modo bot. */
  async obtenerOAbrir(viveroId: string, clienteId: string, canal: Canal): Promise<Conversacion> {
    const abierta = await this.conversaciones.findOne({
      where: { viveroId, clienteId, canal, estado: EstadoConversacion.ABIERTA },
      order: { creadoEn: 'DESC' },
    });
    if (abierta) return abierta;
    return this.conversaciones.save(
      this.conversaciones.create({
        viveroId,
        clienteId,
        canal,
        modo: ModoConversacion.BOT,
        historialIa: [],
      }),
    );
  }

  async obtener(viveroId: string, id: string): Promise<Conversacion> {
    const c = await this.conversaciones.findOne({
      where: { id, viveroId },
      relations: { cliente: true, asignadoA: true },
    });
    if (!c) throw new NotFoundException('Conversación no encontrada');
    return c;
  }

  async obtenerDeCliente(clienteId: string, id: string): Promise<Conversacion> {
    const c = await this.conversaciones.findOne({ where: { id, clienteId } });
    if (!c) throw new NotFoundException('Conversación no encontrada');
    return c;
  }

  async listar(viveroId: string, f: FiltroConversacionesDto) {
    const qb = this.conversaciones
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.cliente', 'cl')
      .leftJoinAndSelect('c.asignadoA', 'u')
      .where('c.vivero_id = :viveroId', { viveroId });
    if (f.estado) qb.andWhere('c.estado = :estado', { estado: f.estado });
    if (f.modo) qb.andWhere('c.modo = :modo', { modo: f.modo });
    if (f.canal) qb.andWhere('c.canal = :canal', { canal: f.canal });
    if (f.asignadoAId)
      qb.andWhere('c.asignado_a_id = :asignadoAId', { asignadoAId: f.asignadoAId });
    if (f.buscar)
      qb.andWhere('(cl.nombre ILIKE :q OR cl.email ILIKE :q OR cl.whatsapp ILIKE :q)', {
        q: `%${f.buscar}%`,
      });
    qb.orderBy('c.ultimoMensajeEn', 'DESC', 'NULLS LAST').skip(f.skip).take(f.limite);
    const [datos, total] = await qb.getManyAndCount();
    return paginar(datos, total, f);
  }

  listarDeCliente(clienteId: string): Promise<Conversacion[]> {
    return this.conversaciones.find({ where: { clienteId }, order: { ultimoMensajeEn: 'DESC' } });
  }

  async agregarMensaje(conversacion: Conversacion, nuevo: NuevoMensaje): Promise<Mensaje> {
    const mensaje = await this.mensajes.save(
      this.mensajes.create({
        viveroId: conversacion.viveroId,
        conversacionId: conversacion.id,
        emisor: nuevo.emisor,
        emisorId: nuevo.emisorId ?? null,
        contenido: nuevo.contenido,
        tipo: nuevo.tipo ?? TipoMensaje.TEXTO,
        metadata: nuevo.metadata ?? {},
        leido: false,
      }),
    );
    conversacion.ultimoMensajeEn = mensaje.creadoEn;
    conversacion.ultimoMensajeTexto = nuevo.contenido.slice(0, 200);
    if (nuevo.emisor === EmisorMensaje.CLIENTE) conversacion.noLeidosPanel += 1;
    else if (nuevo.emisor !== EmisorMensaje.SISTEMA) conversacion.noLeidosCliente += 1;
    await this.conversaciones.save(conversacion);
    return mensaje;
  }

  async listarMensajes(conversacionId: string, dto: PaginacionDto) {
    const [datos, total] = await this.mensajes.findAndCount({
      where: { conversacionId },
      order: { creadoEn: 'DESC' },
      skip: dto.skip,
      take: dto.limite,
    });
    return paginar(datos.reverse(), total, dto);
  }

  /** Guarda el historial neutro para la IA, recortado a los últimos N ítems. */
  async guardarHistorialIa(conversacion: Conversacion, historial: MensajeIA[]): Promise<void> {
    const max = this.config.get<number>('ia.historialMaxMensajes') ?? 40;
    conversacion.historialIa = this.recortarHistorial(historial, max);
    await this.conversaciones.save(conversacion);
  }

  /**
   * Recorta sin dejar huérfanos: nunca arranca con un resultado de herramienta
   * cuya llamada quedó afuera (los proveedores rechazan eso).
   */
  recortarHistorial(historial: MensajeIA[], max: number): MensajeIA[] {
    let recortado = historial.slice(-max);
    while (recortado.length && recortado[0].rol !== 'usuario') recortado = recortado.slice(1);
    return recortado;
  }

  async marcarLeidosPanel(conversacion: Conversacion): Promise<void> {
    await this.mensajes.update(
      { conversacionId: conversacion.id, emisor: EmisorMensaje.CLIENTE, leido: false },
      { leido: true },
    );
    conversacion.noLeidosPanel = 0;
    await this.conversaciones.save(conversacion);
  }

  async marcarLeidosCliente(conversacion: Conversacion): Promise<void> {
    conversacion.noLeidosCliente = 0;
    await this.conversaciones.save(conversacion);
  }

  async asignar(
    conversacion: Conversacion,
    usuarioId: string,
    motivo?: string,
  ): Promise<Conversacion> {
    conversacion.asignadoAId = usuarioId;
    conversacion.modo = ModoConversacion.HUMANO;
    if (motivo) conversacion.motivoDerivacion = motivo;
    return this.conversaciones.save(conversacion);
  }

  /** Pasa a humano sin asignar a nadie: queda en la bandeja "sin asignar" del panel. */
  async derivarAHumano(conversacion: Conversacion, motivo: string): Promise<Conversacion> {
    conversacion.modo = ModoConversacion.HUMANO;
    conversacion.motivoDerivacion = motivo;
    return this.conversaciones.save(conversacion);
  }

  async devolverAlBot(conversacion: Conversacion): Promise<Conversacion> {
    conversacion.modo = ModoConversacion.BOT;
    conversacion.asignadoAId = null;
    conversacion.motivoDerivacion = null;
    return this.conversaciones.save(conversacion);
  }

  async cerrar(conversacion: Conversacion): Promise<Conversacion> {
    conversacion.estado = EstadoConversacion.CERRADA;
    return this.conversaciones.save(conversacion);
  }

  async guardarResumen(conversacion: Conversacion, resumen: string): Promise<void> {
    conversacion.resumenIa = resumen;
    await this.conversaciones.save(conversacion);
  }

  /** Para la pantalla de inicio del panel. */
  async resumen(viveroId: string) {
    const abiertas = await this.conversaciones.count({
      where: { viveroId, estado: EstadoConversacion.ABIERTA },
    });
    const enHumano = await this.conversaciones.count({
      where: { viveroId, estado: EstadoConversacion.ABIERTA, modo: ModoConversacion.HUMANO },
    });
    const sinAsignar = await this.conversaciones
      .createQueryBuilder('c')
      .where(
        'c.vivero_id = :viveroId AND c.estado = :e AND c.modo = :m AND c.asignado_a_id IS NULL',
        { viveroId, e: EstadoConversacion.ABIERTA, m: ModoConversacion.HUMANO },
      )
      .getCount();
    const { suma } = (await this.conversaciones
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.noLeidosPanel), 0)', 'suma')
      .where('c.vivero_id = :viveroId', { viveroId })
      .getRawOne<{ suma: string }>()) ?? { suma: '0' };
    return { abiertas, enHumano, sinAsignar, noLeidos: Number(suma) };
  }
}
