import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { PaginacionDto } from '../../../common/dto/paginacion.dto';
import { Canal } from '../../../common/enums';
import { EstadoConversacion, ModoConversacion } from '../entities/conversacion.entity';

export class FiltroConversacionesDto extends PaginacionDto {
  @ApiPropertyOptional({ enum: EstadoConversacion })
  @IsOptional()
  @IsEnum(EstadoConversacion)
  estado?: EstadoConversacion;

  @ApiPropertyOptional({ enum: ModoConversacion })
  @IsOptional()
  @IsEnum(ModoConversacion)
  modo?: ModoConversacion;

  @ApiPropertyOptional({ enum: Canal })
  @IsOptional()
  @IsEnum(Canal)
  canal?: Canal;

  @ApiPropertyOptional({ description: 'Solo las asignadas a este empleado' })
  @IsOptional()
  @IsUUID()
  asignadoAId?: string;
}

export class EnviarMensajeDto {
  @ApiProperty()
  @IsString()
  @Length(1, 4000)
  contenido: string;
}

export class AsignarConversacionDto {
  @ApiPropertyOptional({ description: 'Si no se manda, se asigna a quien hace la petición' })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;
}
