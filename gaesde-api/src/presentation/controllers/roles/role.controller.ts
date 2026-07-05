import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from '../../../application/role/role.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreateRoleDto } from './dto/create-role.dto';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard) // Apenas JwtAuthGuard, sem RolesGuard
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar nova role',
    description: 'Cria uma nova role no sistema. Apenas administradores.',
  })
  @ApiResponse({ status: 201, description: 'Role criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Slug já existe' })
  async create(@Body() data: CreateRoleDto) {
    return this.roleService.create(data);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todas as roles',
    description: 'Retorna a lista de todas as roles do sistema.',
  })
  @ApiResponse({ status: 200, description: 'Lista de roles retornada com sucesso' })
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter role por ID',
    description: 'Retorna os dados de uma role específica.',
  })
  @ApiResponse({ status: 200, description: 'Role encontrada' })
  @ApiResponse({ status: 404, description: 'Role não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar role',
    description: 'Atualiza os dados de uma role. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Role atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Role não encontrada' })
  async update(@Param('id') id: string, @Body() data: { name?: string; slug?: string; description?: string }) {
    return this.roleService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar role',
    description: 'Remove uma role do sistema. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Role deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Role não encontrada' })
  async remove(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}
