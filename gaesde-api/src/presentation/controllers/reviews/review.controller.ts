import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from '../../../application/review/review.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Public } from '../../decorators/public.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar avaliação',
    description: 'Avalia um curso com nota de 1 a 5 estrelas.',
  })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Usuário já avaliou este curso' })
  async create(@Body() data: CreateReviewDto, @Request() req) {
    const userId = req.user.userId;
    return this.reviewService.create(userId, data.courseId, data.rating, data.comment);
  }

  @Get('course/:courseId')
  @Public()
  @ApiOperation({
    summary: 'Listar avaliações de um curso',
    description: 'Retorna todas as avaliações de um curso específico.',
  })
  @ApiResponse({ status: 200, description: 'Lista de avaliações retornada com sucesso' })
  async findByCourse(@Param('courseId') courseId: string) {
    return this.reviewService.findByCourse(courseId);
  }

  @Get('course/:courseId/stats')
  @Public()
  @ApiOperation({
    summary: 'Estatísticas de avaliações',
    description: 'Retorna a média, total e distribuição das avaliações de um curso.',
  })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  async getCourseStats(@Param('courseId') courseId: string) {
    return this.reviewService.getCourseStats(courseId);
  }

  @Get('user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Minhas avaliações',
    description: 'Retorna todas as avaliações do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de avaliações retornada com sucesso' })
  async findByUser(@Request() req) {
    const userId = req.user.userId;
    return this.reviewService.findByUser(userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obter avaliação por ID',
    description: 'Retorna uma avaliação específica pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Avaliação encontrada' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.reviewService.findById(id);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar avaliação',
    description: 'Atualiza a nota ou comentário de uma avaliação.',
  })
  @ApiResponse({ status: 200, description: 'Avaliação atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async update(@Param('id') id: string, @Body() data: UpdateReviewDto, @Request() req) {
    const review = await this.reviewService.findById(id);
    if (review.userId !== req.user.userId) {
      throw new Error('Você só pode atualizar suas próprias avaliações');
    }
    return this.reviewService.update(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar avaliação',
    description: 'Remove uma avaliação.',
  })
  @ApiResponse({ status: 200, description: 'Avaliação deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async remove(@Param('id') id: string, @Request() req) {
    const review = await this.reviewService.findById(id);
    if (review.userId !== req.user.userId) {
      throw new Error('Você só pode deletar suas próprias avaliações');
    }
    return this.reviewService.delete(id);
  }
}
