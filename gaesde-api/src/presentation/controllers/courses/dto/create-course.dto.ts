import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max, MaxLength, MinLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseLevel, CourseStatus } from '../../../../domain/course/course.entity';

export class CreateCourseDto {
  @ApiProperty({
    example: 'NestJS do Zero ao Avançado',
    description: 'Título do curso',
    minLength: 3,
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'nestjs-zero-avancado',
    description: 'Slug do curso (único)',
    minLength: 3,
    maxLength: 200,
    pattern: '^[a-z0-9-]+$',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug deve conter apenas letras minúsculas, números e hífens' })
  slug: string;

  @ApiProperty({
    example: 'Aprenda NestJS com TypeScript e MongoDB',
    description: 'Descrição do curso',
    required: false,
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../cover.jpg',
    description: 'URL da imagem de capa',
    required: false,
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({
    example: 199.90,
    description: 'Preço do curso (0 para gratuito)',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    enum: CourseStatus,
    example: CourseStatus.DRAFT,
    description: 'Status do curso',
    default: CourseStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiProperty({
    enum: CourseLevel,
    example: CourseLevel.INTERMEDIATE,
    description: 'Nível do curso',
  })
  @IsNotEmpty()
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID da categoria (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  // instructorId será definido automaticamente pelo controller
  instructorId?: string;
}
