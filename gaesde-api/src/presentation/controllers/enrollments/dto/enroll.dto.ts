import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollDto {
  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID do curso',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879ab',
    description: 'ID do usuário para matrícula administrativa/professor',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
