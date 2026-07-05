import { IsNotEmpty, IsOptional, IsString, IsUrl, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=abc123',
    description: 'URL do vídeo (YouTube, Vimeo, S3, Cloudinary)',
  })
  @IsNotEmpty()
  @IsUrl()
  videoUrl: string;

  @ApiProperty({
    example: 600,
    description: 'Duração do vídeo em segundos',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  videoDurationSeconds?: number;
}
