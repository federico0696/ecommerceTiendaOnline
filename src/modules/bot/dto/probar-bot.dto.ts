import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class ProbarBotDto {
  @ApiProperty()
  @IsString()
  @Length(1, 2000)
  mensaje: string;

  @ApiPropertyOptional({
    description: 'Cliente con el que simular. Si no se manda, se usa un cliente de prueba.',
  })
  @IsOptional()
  @IsUUID()
  clienteId?: string;
}
