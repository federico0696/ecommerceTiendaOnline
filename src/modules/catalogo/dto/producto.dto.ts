import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { PaginacionDto } from '../../../common/dto/paginacion.dto';
import { FichaCuidado, TipoProducto } from '../entities/producto.entity';

export class CrearProductoDto {
  @ApiProperty()
  @IsString()
  @Length(2, 160)
  nombre: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 160)
  nombreCientifico?: string;

  @ApiPropertyOptional({ enum: TipoProducto })
  @IsOptional()
  @IsEnum(TipoProducto)
  tipo?: TipoProducto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  precio: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioOferta?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ default: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockMinimo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 60)
  sku?: string;

  @ApiPropertyOptional({ description: 'Ficha de cuidados (parcial, se completa con nulls)' })
  @IsOptional()
  @IsObject()
  cuidados?: Partial<FichaCuidado>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  etiquetas?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  destacado?: boolean;
}

export class ActualizarProductoDto extends PartialType(CrearProductoDto) {}

export class FiltroProductosDto extends PaginacionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @ApiPropertyOptional({ enum: TipoProducto })
  @IsOptional()
  @IsEnum(TipoProducto)
  tipo?: TipoProducto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  luz?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  soloConStock?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  destacados?: boolean;
}

export class AjustarStockDto {
  @ApiProperty({ description: 'Positivo suma, negativo resta' })
  @IsInt()
  cantidad: number;

  @ApiProperty({ enum: ['compra', 'ajuste', 'merma', 'devolucion'] })
  @IsString()
  motivo: 'compra' | 'ajuste' | 'merma' | 'devolucion';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacion?: string;
}

export class AgregarImagenDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clave?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  principal?: boolean;
}
