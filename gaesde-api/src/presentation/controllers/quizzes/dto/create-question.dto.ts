import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '../../../../domain/question/question.entity';

export class CreateQuestionDto {
  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID do quiz',
  })
  @IsNotEmpty()
  @IsString()
  quizId: string;

  @ApiProperty({
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
    description: 'Tipo da questão',
  })
  @IsNotEmpty()
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    example: 'Qual é a capital do Brasil?',
    description: 'Texto da questão',
  })
  @IsNotEmpty()
  @IsString()
  questionText: string;

  @ApiProperty({
    example: 2,
    description: 'Pontos da questão',
    default: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiProperty({
    example: 0,
    description: 'Ordem de exibição no quiz',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderIndex?: number;
}
