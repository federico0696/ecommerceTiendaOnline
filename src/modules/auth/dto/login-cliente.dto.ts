import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginClienteDto {
  @ApiProperty({ description: 'Slug del vivero al que pertenece la app', example: 'las-acacias' })
  @IsString()
  vivero: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}
