import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionOptionDto {
  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID da questão',
  })
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @ApiProperty({
    example: 'Brasília',
    description: 'Texto da opção',
  })
  @IsNotEmpty()
  @IsString()
  optionText: string;

  @ApiProperty({
    example: true,
    description: 'Se a opção é correta',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
