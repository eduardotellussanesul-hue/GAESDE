import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, Min, MaxLength, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../../../domain/content/content.entity';

export class CreateContentDto {
  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID do módulo',
  })
  @IsNotEmpty()
  @IsString()
  moduleId: string;

  @ApiProperty({
    example: 'O que é NestJS?',
    description: 'Título do conteúdo',
    minLength: 2,
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    enum: ContentType,
    example: ContentType.VIDEO,
    description: 'Tipo do conteúdo',
  })
  @IsNotEmpty()
  @IsEnum(ContentType)
  type: ContentType;

  @ApiProperty({
    example: 0,
    description: 'Ordem de exibição no módulo',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  orderIndex: number;

  @ApiProperty({
    example: true,
    description: 'Se o conteúdo é uma prévia gratuita',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFreePreview?: boolean;

  @ApiProperty({
    example: 600,
    description: 'Duração em segundos (apenas para vídeos)',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationSeconds?: number;
}
