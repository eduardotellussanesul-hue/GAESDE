import { IsNotEmpty, IsOptional, IsUrl, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePdfDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/.../documento.pdf',
    description: 'URL do arquivo PDF',
  })
  @IsNotEmpty()
  @IsUrl()
  fileUrl: string;

  @ApiProperty({
    example: 1024000,
    description: 'Tamanho do arquivo em bytes',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSizeBytes?: number;
}
