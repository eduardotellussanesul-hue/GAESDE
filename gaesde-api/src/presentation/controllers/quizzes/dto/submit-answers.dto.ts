import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AnswerDto {
  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID da questão',
  })
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879ab',
    description: 'ID da opção selecionada (para questões objetivas)',
    required: false,
  })
  @IsOptional()
  @IsString()
  selectedOptionId?: string;

  @ApiProperty({
    example: 'Resposta discursiva do aluno...',
    description: 'Resposta textual (para questões essay)',
    required: false,
  })
  @IsOptional()
  @IsString()
  textResponse?: string;
}

export class SubmitAnswersDto {
  @ApiProperty({
    type: [AnswerDto],
    description: 'Lista de respostas',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
