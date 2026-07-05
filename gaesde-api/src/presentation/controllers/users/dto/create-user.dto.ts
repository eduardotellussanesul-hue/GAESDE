import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsUrl, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email do usuário (único)',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha do usuário (mínimo 6 caracteres)',
    minLength: 6,
    maxLength: 100,
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'https://ui-avatars.com/api/?name=Joao+Silva',
    description: 'URL do avatar do usuário (opcional)',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiProperty({
    example: 'Desenvolvedor Full Stack com 5 anos de experiência',
    description: 'Biografia do usuário (opcional)',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
