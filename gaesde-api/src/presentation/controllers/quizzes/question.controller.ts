import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionService } from '../../../application/question/question.service';
import { QuestionType } from '../../../domain/question/question.entity';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReorderDto } from '../modules/dto/reorder.dto';

@ApiTags('questions')
@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Post()
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar questão',
    description: 'Cria uma nova questão para um quiz. Tipos: multiple_choice, true_false, essay, matching.',
  })
  @ApiResponse({ status: 201, description: 'Questão criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Quiz não encontrado' })
  async create(@Body() data: CreateQuestionDto) {
    return this.questionService.create(data);
  }

  @Get('quiz/:quizId')
  @Public()
  @ApiOperation({
    summary: 'Listar questões de um quiz',
    description: 'Retorna todas as questões de um quiz específico.',
  })
  @ApiResponse({ status: 200, description: 'Lista de questões retornada com sucesso' })
  async findByQuiz(@Param('quizId') quizId: string) {
    return this.questionService.findByQuiz(quizId);
  }

  @Get()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todas as questões',
    description: 'Retorna todas as questões. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Lista de questões retornada com sucesso' })
  async findAll() {
    return this.questionService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obter questão por ID',
    description: 'Retorna uma questão específica pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Questão encontrada' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.questionService.findById(id);
  }

  @Put(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar questão',
    description: 'Atualiza os dados de uma questão. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Questão atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async update(@Param('id') id: string, @Body() data: Partial<CreateQuestionDto>) {
    return this.questionService.update(id, data);
  }

  @Post('reorder')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reordenar questões',
    description: 'Altera a ordem das questões de um quiz.',
  })
  @ApiResponse({ status: 200, description: 'Questões reordenadas com sucesso' })
  async reorder(@Body() data: ReorderDto) {
    return this.questionService.reorderQuestions(data.parentId, data.ids);
  }

  @Delete(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar questão',
    description: 'Remove uma questão. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Questão deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async remove(@Param('id') id: string) {
    return this.questionService.delete(id);
  }
}
