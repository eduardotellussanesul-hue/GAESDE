import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizAttemptService } from '../../../application/quiz-attempt/quiz-attempt.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { SubmitAnswersDto } from '../quizzes/dto/submit-answers.dto';

@ApiTags('quiz-attempts')
@Controller('quiz-attempts')
@UseGuards(JwtAuthGuard)
export class QuizAttemptController {
  constructor(private attemptService: QuizAttemptService) {}

  @Post('start/:quizId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Iniciar tentativa',
    description: 'Inicia uma nova tentativa de quiz para o usuário autenticado.',
  })
  @ApiResponse({ status: 201, description: 'Tentativa iniciada com sucesso' })
  @ApiResponse({ status: 400, description: 'Limite de tentativas excedido' })
  @ApiResponse({ status: 404, description: 'Quiz não encontrado' })
  async startAttempt(@Param('quizId') quizId: string, @Request() req) {
    const userId = req.user.userId;
    return this.attemptService.startAttempt(userId, quizId);
  }

  @Post('submit/:attemptId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Submeter respostas',
    description: 'Submete as respostas de uma tentativa e calcula o resultado.',
  })
  @ApiResponse({ status: 200, description: 'Respostas submetidas com sucesso' })
  @ApiResponse({ status: 400, description: 'Tentativa já finalizada' })
  @ApiResponse({ status: 404, description: 'Tentativa não encontrada' })
  async submitAttempt(@Param('attemptId') attemptId: string, @Body() data: SubmitAnswersDto) {
    return this.attemptService.submitAttempt(attemptId, data.answers);
  }

  @Get('user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Minhas tentativas',
    description: 'Retorna todas as tentativas do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de tentativas retornada com sucesso' })
  async findByUser(@Request() req) {
    const userId = req.user.userId;
    return this.attemptService.findByUser(userId);
  }

  @Get('quiz/:quizId')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar tentativas por quiz',
    description: 'Retorna as tentativas de um quiz específico. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Lista de tentativas retornada com sucesso' })
  async findByQuiz(@Param('quizId') quizId: string) {
    return this.attemptService.findByQuiz(quizId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter tentativa por ID',
    description: 'Retorna uma tentativa específica pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Tentativa encontrada' })
  @ApiResponse({ status: 404, description: 'Tentativa não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.attemptService.findById(id);
  }

  @Get(':id/results')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter resultados da tentativa',
    description: 'Retorna os detalhes da tentativa com as respostas e pontuação.',
  })
  @ApiResponse({ status: 200, description: 'Resultados retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Tentativa não encontrada' })
  async getResults(@Param('id') id: string) {
    return this.attemptService.getAttemptResults(id);
  }

  @Post(':id/abandon')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Abandonar tentativa',
    description: 'Marca uma tentativa como abandonada.',
  })
  @ApiResponse({ status: 200, description: 'Tentativa abandonada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tentativa não encontrada' })
  async abandonAttempt(@Param('id') id: string) {
    return this.attemptService.abandonAttempt(id);
  }
}
