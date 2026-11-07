import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, Length } from 'class-validator';

export class ActualizarPerfilDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 120)
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 40)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 30)
  whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aceptaNotificaciones?: boolean;

  @ApiPropertyOptional({ description: 'Luz, espacio, mascotas, experiencia, etc. Lo usa el bot.' })
  @IsOptional()
  @IsObject()
  perfilJardin?: Record<string, unknown>;
}
