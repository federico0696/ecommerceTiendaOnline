import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { CanalNotificacion } from '../entities/notificacion.entity';

export class EnviarNotificacionDto {
  @ApiProperty({ enum: CanalNotificacion })
  @IsEnum(CanalNotificacion)
  canal: CanalNotificacion;

  @ApiProperty()
  @IsString()
  @Length(1, 160)
  titulo: string;

  @ApiProperty()
  @IsString()
  @Length(1, 2000)
  cuerpo: string;

  @ApiPropertyOptional({
    description:
      'Si no se manda, va a TODOS los clientes del vivero que aceptan notificaciones (campaña).',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  clienteIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  datos?: Record<string, unknown>;
}
