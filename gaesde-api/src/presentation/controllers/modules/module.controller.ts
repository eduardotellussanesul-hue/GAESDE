import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ModuleService } from '../../../application/module/module.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ReorderDto } from './dto/reorder.dto';

@ApiTags('modules')
@Controller('modules')
@UseGuards(JwtAuthGuard)
export class ModuleController {
  constructor(private moduleService: ModuleService) {}

  @Post()
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar módulo',
    description: 'Cria um novo módulo em um curso. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 201, description: 'Módulo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async create(@Body() data: CreateModuleDto) {
    return this.moduleService.create(data);
  }

  @Get()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todos os módulos',
    description: 'Retorna todos os módulos. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Lista de módulos retornada com sucesso' })
  async findAll() {
    return this.moduleService.findAll();
  }

  @Get('course/:courseId')
  @Public()
  @ApiOperation({
    summary: 'Listar módulos de um curso',
    description: 'Retorna todos os módulos de um curso específico.',
  })
  @ApiResponse({ status: 200, description: 'Lista de módulos retornada com sucesso' })
  async findByCourse(@Param('courseId') courseId: string) {
    return this.moduleService.findByCourse(courseId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obter módulo por ID',
    description: 'Retorna um módulo específico pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Módulo encontrado' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.moduleService.findById(id);
  }

  @Put(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar módulo',
    description: 'Atualiza os dados de um módulo. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Módulo atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  async update(@Param('id') id: string, @Body() data: UpdateModuleDto) {
    return this.moduleService.update(id, data);
  }

  @Post('reorder')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reordenar módulos',
    description: 'Altera a ordem dos módulos de um curso. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Módulos reordenados com sucesso' })
  async reorderModules(@Body() data: ReorderDto) {
    return this.moduleService.reorderModules(data.parentId, data.ids);
  }

  @Delete(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar módulo',
    description: 'Remove um módulo. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Módulo deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  async remove(@Param('id') id: string) {
    return this.moduleService.delete(id);
  }
}
