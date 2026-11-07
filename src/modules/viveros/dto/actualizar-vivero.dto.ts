import { PartialType } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { ConfiguracionVivero } from '../entities/vivero.entity';
import { CrearViveroDto } from './crear-vivero.dto';

export class ActualizarViveroDto extends PartialType(CrearViveroDto) {
  /** Se mergea con la configuración existente, no la reemplaza completa. */
  @IsOptional()
  @IsObject()
  configuracion?: Partial<ConfiguracionVivero>;
}
