import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CrearCategoriaDto {
  @ApiProperty()
  @IsString()
  @Length(2, 80)
  nombre: string;

  @ApiPropertyOptional({ description: 'Si no se manda se genera a partir del nombre' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  orden?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class ActualizarCategoriaDto extends PartialType(CrearCategoriaDto) {}
