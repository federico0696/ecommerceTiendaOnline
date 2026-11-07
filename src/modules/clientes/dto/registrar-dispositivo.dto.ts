import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class RegistrarDispositivoDto {
  @ApiProperty()
  @IsString()
  @Length(10, 512)
  tokenFcm: string;

  @ApiPropertyOptional({ enum: ['android', 'ios'], default: 'android' })
  @IsOptional()
  @IsIn(['android', 'ios'])
  plataforma?: 'android' | 'ios';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 120)
  modelo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 40)
  versionApp?: string;
}
