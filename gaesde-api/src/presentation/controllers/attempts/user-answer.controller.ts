import { Controller, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserAnswerService } from '../../../application/user-answer/user-answer.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('user-answers')
@Controller('user-answers')
@UseGuards(JwtAuthGuard)
export class UserAnswerController {
  constructor(private answerService: UserAnswerService) {}

  @Get('attempt/:attemptId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar respostas de uma tentativa',
    description: 'Retorna todas as respostas de uma tentativa específica.',
  })
  @ApiResponse({ status: 200, description: 'Lista de respostas retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tentativa não encontrada' })
  async findByAttempt(@Param('attemptId') attemptId: string) {
    return this.answerService.findByAttempt(attemptId);
  }

  @Get('question/:questionId')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar respostas por questão',
    description: 'Retorna as respostas de uma questão específica. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Lista de respostas retornada com sucesso' })
  async findByQuestion(@Param('questionId') questionId: string) {
    return this.answerService.findByQuestion(questionId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter resposta por ID',
    description: 'Retorna uma resposta específica pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Resposta encontrada' })
  @ApiResponse({ status: 404, description: 'Resposta não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.answerService.findById(id);
  }

  @Put(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar resposta',
    description: 'Atualiza a pontuação ou correção de uma resposta. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Resposta atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Resposta não encontrada' })
  async update(@Param('id') id: string, @Body() data: { pointsEarned?: number; isCorrect?: boolean }) {
    return this.answerService.updateAnswer(id, data);
  }

  @Delete(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar resposta',
    description: 'Remove uma resposta. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Resposta deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Resposta não encontrada' })
  async remove(@Param('id') id: string) {
    return this.answerService.delete(id);
  }
}
