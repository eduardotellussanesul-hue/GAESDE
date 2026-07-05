import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Desenvolvimento Web',
    description: 'Nome da categoria',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'desenvolvimento-web',
    description: 'Slug da categoria (único)',
    minLength: 2,
    maxLength: 100,
    pattern: '^[a-z0-9-]+$',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug deve conter apenas letras minúsculas, números e hífens' })
  slug: string;

  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID da categoria pai (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
