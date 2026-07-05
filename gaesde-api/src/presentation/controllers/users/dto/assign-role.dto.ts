import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879aa',
    description: 'ID do usuário',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    example: '6a4a9f1d9cb9ec15ee5879ab',
    description: 'ID da role',
  })
  @IsNotEmpty()
  @IsString()
  roleId: string;
}
