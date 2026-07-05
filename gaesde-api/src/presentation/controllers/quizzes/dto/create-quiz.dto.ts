import { IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, Max, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID do conteúdo (tipo quiz)',
  })
  @IsNotEmpty()
  @IsString()
  contentId: string;

  @ApiProperty({
    example: 30,
    description: 'Tempo limite em minutos (null = sem limite)',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeLimitMinutes?: number;

  @ApiProperty({
    example: 60,
    description: 'Porcentagem para aprovação (0-100)',
    default: 60,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScorePercentage?: number;

  @ApiProperty({
    example: 3,
    description: 'Número de tentativas permitidas',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  attemptsAllowed?: number;

  @ApiProperty({
    example: true,
    description: 'Embaralhar as questões',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;
}
