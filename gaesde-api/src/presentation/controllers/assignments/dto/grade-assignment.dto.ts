import { IsNotEmpty, IsOptional, IsNumber, IsString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GradeAssignmentDto {
  @ApiProperty({
    example: 85,
    description: 'Nota de 0 a 100',
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  grade: number;

  @ApiProperty({
    example: 'Excelente trabalho! Continue assim.',
    description: 'Feedback do instrutor',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  feedback?: string;
}
