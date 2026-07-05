import { Controller, Post, Delete, Get, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRoleService } from '../../../application/user-role/user-role.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('user-roles')
@Controller('user-roles')
@UseGuards(JwtAuthGuard) // Apenas JwtAuthGuard
export class UserRoleController {
  constructor(private userRoleService: UserRoleService) {}

  @Post('assign')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atribuir role a um usuário',
    description: 'Atribui uma role a um usuário específico. Apenas administradores.',
  })
  @ApiResponse({ status: 201, description: 'Role atribuída com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Usuário ou role não encontrado' })
  async assignRole(@Body() data: AssignRoleDto) {
    return this.userRoleService.assignRole(data.userId, data.roleId);
  }

  @Delete('remove/:userId/:roleId')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Remover role de um usuário',
    description: 'Remove uma role de um usuário específico. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Role removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário ou role não encontrado' })
  async removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userRoleService.removeRole(userId, roleId);
  }

  @Get('user/:userId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar roles de um usuário',
    description: 'Retorna todas as roles atribuídas a um usuário específico.',
  })
  @ApiResponse({ status: 200, description: 'Lista de roles retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserRoles(@Param('userId') userId: string) {
    return this.userRoleService.getUserRoles(userId);
  }

  @Get('role/:roleId')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar usuários por role',
    description: 'Retorna todos os usuários que possuem uma determinada role. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  async getUsersByRole(@Param('roleId') roleId: string) {
    return this.userRoleService.getUsersByRole(roleId);
  }

  @Get('has-role/:userId/:roleSlug')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verificar se usuário tem uma role',
    description: 'Verifica se um usuário possui uma determinada role.',
  })
  @ApiResponse({ status: 200, description: 'Verificação realizada com sucesso' })
  async hasRole(@Param('userId') userId: string, @Param('roleSlug') roleSlug: string) {
    return { hasRole: await this.userRoleService.hasRole(userId, roleSlug) };
  }
}
