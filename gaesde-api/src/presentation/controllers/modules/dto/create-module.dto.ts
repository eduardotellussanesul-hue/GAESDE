import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID do curso',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({
    example: 'Introdução ao NestJS',
    description: 'Título do módulo',
    minLength: 2,
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Fundamentos do framework NestJS',
    description: 'Descrição do módulo',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    example: 0,
    description: 'Ordem de exibição no curso (começa em 0)',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  orderIndex: number;
}
