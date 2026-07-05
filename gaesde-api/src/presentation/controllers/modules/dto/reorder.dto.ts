import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderDto {
  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID do curso/módulo/quiz',
  })
  @IsNotEmpty()
  @IsString()
  parentId: string;

  @ApiProperty({
    example: ['id1', 'id2', 'id3'],
    description: 'Lista de IDs na nova ordem',
  })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
