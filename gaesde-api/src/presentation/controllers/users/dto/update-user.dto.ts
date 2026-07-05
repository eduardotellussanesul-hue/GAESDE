import { IsEmail, IsOptional, MinLength, MaxLength, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'novo.email@email.com',
    description: 'Novo email do usuário',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({
    example: 'NovaSenha@123',
    description: 'Nova senha do usuário (mínimo 6 caracteres)',
    required: false,
    minLength: 6,
  })
  @IsOptional()
  @MinLength(6)
  @MaxLength(100)
  password?: string;

  @ApiProperty({
    example: 'João Silva Santos',
    description: 'Novo nome completo',
    required: false,
  })
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'https://ui-avatars.com/api/?name=Joao+Silva+Santos',
    description: 'Nova URL do avatar',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiProperty({
    example: 'Tech Lead com 10 anos de experiência',
    description: 'Nova biografia',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
