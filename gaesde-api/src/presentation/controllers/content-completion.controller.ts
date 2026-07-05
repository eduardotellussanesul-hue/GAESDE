import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContentCompletionService } from '../../application/content-completion/content-completion.service';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { CompleteContentDto } from './enrollments/dto/complete-content.dto';

@ApiTags('completions')
@Controller('completions')
@UseGuards(JwtAuthGuard)
export class ContentCompletionController {
  constructor(private completionService: ContentCompletionService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Marcar conteúdo como concluído',
    description: 'Marca um conteúdo como concluído para o usuário autenticado.',
  })
  @ApiResponse({ status: 201, description: 'Conteúdo marcado como concluído com sucesso' })
  @ApiResponse({ status: 400, description: 'Conteúdo já concluído' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async complete(@Body() data: CompleteContentDto, @Request() req) {
    const userId = req.user.userId;
    return this.completionService.complete(userId, data.contentId);
  }

  @Get('my-completions')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Minhas conclusões',
    description: 'Retorna todos os conteúdos concluídos pelo usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de conclusões retornada com sucesso' })
  async getMyCompletions(@Request() req) {
    const userId = req.user.userId;
    return this.completionService.findByUser(userId);
  }

  @Get('progress/:courseId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Progresso no curso',
    description: 'Retorna o progresso do usuário autenticado em um curso específico.',
  })
  @ApiResponse({ status: 200, description: 'Progresso retornado com sucesso' })
  async getProgress(@Param('courseId') courseId: string, @Request() req) {
    const userId = req.user.userId;
    return this.completionService.getProgress(userId, courseId);
  }

  @Get('user/:userId')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar conclusões por usuário',
    description: 'Retorna as conclusões de um usuário específico. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Lista de conclusões retornada com sucesso' })
  async findByUser(@Param('userId') userId: string) {
    return this.completionService.findByUser(userId);
  }

  @Get('content/:contentId')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar usuários que concluíram um conteúdo',
    description: 'Retorna os usuários que concluíram um conteúdo específico. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  async findByContent(@Param('contentId') contentId: string) {
    return this.completionService.findByContent(contentId);
  }

  @Get('check/:contentId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verificar se conteúdo foi concluído',
    description: 'Verifica se o usuário autenticado já concluiu um conteúdo específico.',
  })
  @ApiResponse({ status: 200, description: 'Verificação realizada com sucesso' })
  async checkCompletion(@Param('contentId') contentId: string, @Request() req) {
    const userId = req.user.userId;
    return this.completionService.findByUserAndContent(userId, contentId);
  }

  @Delete(':contentId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Desmarcar conteúdo como concluído',
    description: 'Remove a marcação de conclusão de um conteúdo.',
  })
  @ApiResponse({ status: 200, description: 'Conteúdo desmarcado com sucesso' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async uncomplete(@Param('contentId') contentId: string, @Request() req) {
    const userId = req.user.userId;
    return this.completionService.uncomplete(userId, contentId);
  }
}
