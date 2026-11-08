import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginacionDto } from '../../../common/dto/paginacion.dto';
import { EstadoPago, EstadoPedido, TipoEntrega } from '../entities/pedido.entity';

export class ItemPedidoDto {
  @ApiProperty()
  @IsUUID()
  productoId: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CrearPedidoDto {
  @ApiProperty({ type: [ItemPedidoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];

  @ApiProperty({ enum: TipoEntrega })
  @IsEnum(TipoEntrega)
  tipoEntrega: TipoEntrega;

  @ApiPropertyOptional({ description: 'Obligatoria si tipoEntrega = envio' })
  @IsOptional()
  @IsString()
  direccionEntrega?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notaCliente?: string;
}

export class CambiarEstadoPedidoDto {
  @ApiProperty({ enum: EstadoPedido })
  @IsEnum(EstadoPedido)
  estado: EstadoPedido;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notaInterna?: string;
}

export class CambiarEstadoPagoDto {
  @ApiProperty({ enum: EstadoPago })
  @IsEnum(EstadoPago)
  estadoPago: EstadoPago;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenciaPago?: string;
}

export class FiltroPedidosDto extends PaginacionDto {
  @ApiPropertyOptional({ enum: EstadoPedido })
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clienteId?: string;
}
