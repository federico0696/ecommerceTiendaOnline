import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginacionDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite = 20;

  @ApiPropertyOptional({ description: 'Texto libre a buscar' })
  @IsOptional()
  @IsString()
  buscar?: string;

  get skip() {
    return (this.pagina - 1) * this.limite;
  }
}

export interface Paginado<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

export const paginar = <T>(datos: T[], total: number, dto: PaginacionDto): Paginado<T> => ({
  datos,
  total,
  pagina: dto.pagina,
  limite: dto.limite,
  paginas: Math.ceil(total / dto.limite) || 1,
});
