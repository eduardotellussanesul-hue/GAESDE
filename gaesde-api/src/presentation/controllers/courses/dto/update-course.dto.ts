import { IsOptional, IsString, IsNumber, Min, MaxLength, MinLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseLevel, CourseStatus } from '../../../../domain/course/course.entity';

export class UpdateCourseDto {
  @ApiProperty({
    example: 'NestJS do Zero ao Avançado - Atualizado',
    description: 'Título do curso',
    required: false,
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    example: 'nestjs-zero-avancado-atualizado',
    description: 'Slug do curso (único)',
    required: false,
    minLength: 3,
    maxLength: 200,
    pattern: '^[a-z0-9-]+$',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug deve conter apenas letras minúsculas, números e hífens' })
  slug?: string;

  @ApiProperty({
    example: 'Aprenda NestJS com TypeScript, MongoDB e JWT',
    description: 'Descrição do curso',
    required: false,
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../cover-nova.jpg',
    description: 'URL da imagem de capa',
    required: false,
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({
    example: 249.90,
    description: 'Preço do curso (0 para gratuito)',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    enum: CourseStatus,
    example: CourseStatus.PUBLISHED,
    description: 'Status do curso',
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiProperty({
    enum: CourseLevel,
    example: CourseLevel.ADVANCED,
    description: 'Nível do curso',
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID da categoria',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
