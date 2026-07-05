import { IsOptional, IsString, IsNumber, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateModuleDto {
  @ApiProperty({
    example: 'Introdução ao NestJS - Atualizado',
    description: 'Título do módulo',
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
    example: 'Fundamentos do framework NestJS com TypeScript',
    description: 'Descrição do módulo',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'Ordem de exibição no curso',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderIndex?: number;
}
