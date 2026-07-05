import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID do curso',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({
    example: 5,
    description: 'Nota de 1 a 5 estrelas',
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Curso excelente! Material muito completo.',
    description: 'Comentário sobre o curso',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
