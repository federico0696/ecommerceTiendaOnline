import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, Length } from 'class-validator';
import { TipoMensaje } from '../../conversaciones/entities/mensaje.entity';

export class MensajeAppDto {
  @ApiProperty()
  @IsString()
  @Length(1, 4000)
  texto: string;

  @ApiPropertyOptional({ enum: TipoMensaje })
  @IsOptional()
  @IsEnum(TipoMensaje)
  tipo?: TipoMensaje;

  @ApiPropertyOptional({ description: 'Adjuntos u otros datos del mensaje' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
