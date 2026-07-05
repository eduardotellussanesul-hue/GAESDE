import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from '../../../application/quiz/quiz.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { CreateQuizDto } from './dto/create-quiz.dto';

@ApiTags('quizzes')
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post()
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar quiz',
    description: 'Cria um novo quiz para um conteúdo. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 201, description: 'Quiz criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async create(@Body() data: CreateQuizDto) {
    return this.quizService.create(data);
  }

  @Get()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar quizzes',
    description: 'Retorna todos os quizzes. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Lista de quizzes retornada com sucesso' })
  async findAll() {
    return this.quizService.findAll();
  }

  @Get('content/:contentId')
  @Public()
  @ApiOperation({
    summary: 'Obter quiz por conteúdo',
    description: 'Retorna o quiz de um conteúdo específico.',
  })
  @ApiResponse({ status: 200, description: 'Quiz encontrado' })
  @ApiResponse({ status: 404, description: 'Quiz não encontrado' })
  async findByContent(@Param('contentId') contentId: string) {
    return this.quizService.findByContent(contentId);
  }

  @Get('content/:contentId/full')
  @Public()
  @ApiOperation({
    summary: 'Obter quiz completo',
    description: 'Retorna o quiz com todas as questões e opções.',
  })
  @ApiResponse({ status: 200, description: 'Quiz completo retornado com sucesso' })
  async getFullQuiz(@Param('contentId') contentId: string) {
    return this.quizService.getFullQuiz(contentId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obter quiz por ID',
    description: 'Retorna um quiz específico pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Quiz encontrado' })
  @ApiResponse({ status: 404, description: 'Quiz não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.quizService.findById(id);
  }

  @Put(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar quiz',
    description: 'Atualiza os dados de um quiz. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Quiz atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Quiz não encontrado' })
  async update(@Param('id') id: string, @Body() data: Partial<CreateQuizDto>) {
    return this.quizService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar quiz',
    description: 'Remove um quiz. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Quiz deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Quiz não encontrado' })
  async remove(@Param('id') id: string) {
    return this.quizService.delete(id);
  }
}
