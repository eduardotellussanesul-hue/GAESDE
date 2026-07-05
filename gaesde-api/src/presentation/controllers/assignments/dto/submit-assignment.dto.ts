import { IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAssignmentDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/.../assignment.pdf',
    description: 'URL do arquivo enviado',
  })
  @IsNotEmpty()
  @IsUrl()
  fileUrl: string;
}
