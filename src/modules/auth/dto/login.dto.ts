import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'root@vivero.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Root1234!' })
  @IsString()
  @MinLength(8)
  password: string;
}
