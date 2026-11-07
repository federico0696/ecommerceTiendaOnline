import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CrearUsuarioDto } from './crear-usuario.dto';

export class ActualizarUsuarioDto extends PartialType(
  OmitType(CrearUsuarioDto, ['password'] as const),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
