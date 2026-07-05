import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CourseService } from '../../../application/course/course.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Post()
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar curso',
    description: 'Cria um novo curso. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 201, description: 'Curso criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Slug já existe' })
  async create(@Body() data: CreateCourseDto, @Request() req) {
    // Adicionar instructorId do usuário logado
    const createData = {
      ...data,
      instructorId: req.user.userId,
    };
    return this.courseService.create(createData);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Listar cursos',
    description: 'Retorna todos os cursos (público).',
  })
  @ApiResponse({ status: 200, description: 'Lista de cursos retornada com sucesso' })
  async findAll() {
    return this.courseService.findAll();
  }

  @Get('published')
  @Public()
  @ApiOperation({
    summary: 'Listar cursos publicados',
    description: 'Retorna apenas os cursos com status "published".',
  })
  @ApiResponse({ status: 200, description: 'Lista de cursos publicados retornada com sucesso' })
  async findPublished() {
    return this.courseService.findPublished();
  }

  @Get('instructor/:instructorId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar cursos por instrutor',
    description: 'Retorna os cursos de um instrutor específico.',
  })
  @ApiResponse({ status: 200, description: 'Lista de cursos retornada com sucesso' })
  async findByInstructor(@Param('instructorId') instructorId: string) {
    return this.courseService.findByInstructor(instructorId);
  }

  @Get('category/:categoryId')
  @Public()
  @ApiOperation({
    summary: 'Listar cursos por categoria',
    description: 'Retorna os cursos de uma categoria específica.',
  })
  @ApiResponse({ status: 200, description: 'Lista de cursos retornada com sucesso' })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.courseService.findByCategory(categoryId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obter curso por ID',
    description: 'Retorna um curso específico pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Curso encontrado' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.courseService.findById(id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({
    summary: 'Obter curso por slug',
    description: 'Retorna um curso específico pelo slug.',
  })
  @ApiResponse({ status: 200, description: 'Curso encontrado' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async findBySlug(@Param('slug') slug: string) {
    return this.courseService.findBySlug(slug);
  }

  @Put(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar curso',
    description: 'Atualiza os dados de um curso. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Curso atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async update(@Param('id') id: string, @Body() data: UpdateCourseDto) {
    return this.courseService.update(id, data);
  }

  @Post(':id/publish')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Publicar curso',
    description: 'Altera o status do curso para "published".',
  })
  @ApiResponse({ status: 200, description: 'Curso publicado com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async publish(@Param('id') id: string) {
    return this.courseService.publish(id);
  }

  @Post(':id/archive')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Arquivar curso',
    description: 'Altera o status do curso para "archived".',
  })
  @ApiResponse({ status: 200, description: 'Curso arquivado com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async archive(@Param('id') id: string) {
    return this.courseService.archive(id);
  }

  @Post(':id/restore')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Restaurar curso',
    description: 'Restaura um curso deletado (soft delete). Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Curso restaurado com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async restore(@Param('id') id: string) {
    return this.courseService.restore(id);
  }

  @Delete(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar curso (soft delete)',
    description: 'Marca o curso como deletado (soft delete).',
  })
  @ApiResponse({ status: 200, description: 'Curso deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async remove(@Param('id') id: string) {
    return this.courseService.delete(id);
  }

  @Delete(':id/hard')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar curso permanentemente',
    description: 'Remove o curso do banco de dados. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Curso removido permanentemente' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async hardRemove(@Param('id') id: string) {
    return this.courseService.hardDelete(id);
  }
}
