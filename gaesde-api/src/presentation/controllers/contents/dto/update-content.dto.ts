import { IsOptional, IsString, IsNumber, IsBoolean, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContentDto {
  @ApiProperty({
    example: 'O que é NestJS? - Atualizado',
    description: 'Título do conteúdo',
    required: false,
    minLength: 2,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    example: 1,
    description: 'Ordem de exibição no módulo',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderIndex?: number;

  @ApiProperty({
    example: true,
    description: 'Se o conteúdo é uma prévia gratuita',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isFreePreview?: boolean;

  @ApiProperty({
    example: 900,
    description: 'Duração em segundos (apenas para vídeos)',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationSeconds?: number;
}
