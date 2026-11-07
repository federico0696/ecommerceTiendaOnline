import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, Length, MinLength } from 'class-validator';
import { Rol } from '../../../common/enums';

export class CrearUsuarioDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  @Length(2, 120)
  nombre: string;

  @ApiProperty({ enum: [Rol.ADMIN, Rol.EMPLEADO] })
  @IsEnum(Rol)
  rol: Rol;

  @ApiPropertyOptional({
    description: 'Obligatorio salvo para root. Un admin no puede elegirlo: se usa el suyo.',
  })
  @IsOptional()
  @IsUUID()
  viveroId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 40)
  telefono?: string;
}
