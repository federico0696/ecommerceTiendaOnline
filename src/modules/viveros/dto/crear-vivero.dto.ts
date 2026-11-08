import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CrearViveroDto {
  @ApiProperty({ example: 'Vivero Las Acacias' })
  @IsString()
  @Length(2, 120)
  nombre: string;

  @ApiProperty({ example: 'las-acacias', description: 'Solo minúsculas, números y guiones' })
  @IsString()
  @Length(2, 60)
  @Matches(/^[a-z0-9-]+$/, { message: 'El slug solo admite minúsculas, números y guiones' })
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 160)
  razonSocial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 20)
  cuit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 40)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 80)
  ciudad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 80)
  provincia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLatitude()
  latitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLongitude()
  longitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
