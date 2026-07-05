import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from '../../../application/category/category.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar categoria',
    description: 'Cria uma nova categoria. Apenas administradores.',
  })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Slug já existe' })
  async create(@Body() data: CreateCategoryDto) {
    return this.categoryService.create(data);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Listar categorias',
    description: 'Retorna todas as categorias (público).',
  })
  @ApiResponse({ status: 200, description: 'Lista de categorias retornada com sucesso' })
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get('parents')
  @Public()
  @ApiOperation({
    summary: 'Listar categorias pai',
    description: 'Retorna apenas as categorias que não têm parentId (categorias raiz).',
  })
  @ApiResponse({ status: 200, description: 'Lista de categorias pai retornada com sucesso' })
  async findParents() {
    return this.categoryService.findParents();
  }

  @Get('children/:parentId')
  @Public()
  @ApiOperation({
    summary: 'Listar subcategorias',
    description: 'Retorna as categorias filhas de uma categoria específica.',
  })
  @ApiResponse({ status: 200, description: 'Lista de subcategorias retornada com sucesso' })
  async findChildren(@Param('parentId') parentId: string) {
    return this.categoryService.findChildren(parentId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obter categoria por ID',
    description: 'Retorna uma categoria específica pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({
    summary: 'Obter categoria por slug',
    description: 'Retorna uma categoria específica pelo slug.',
  })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Put(':id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar categoria',
    description: 'Atualiza os dados de uma categoria. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Categoria atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async update(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
    return this.categoryService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar categoria',
    description: 'Remove uma categoria. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Categoria deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 400, description: 'Não é possível deletar categoria com filhos' })
  async remove(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
