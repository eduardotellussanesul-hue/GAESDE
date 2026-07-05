import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTextDto {
  @ApiProperty({
    example: '# Introdução\n\nConteúdo em Markdown...',
    description: 'Corpo do texto (suporta Markdown ou HTML)',
  })
  @IsNotEmpty()
  @IsString()
  body: string;
}
