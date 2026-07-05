import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionOptionService } from '../../../application/question-option/question-option.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { CreateQuestionOptionDto } from './dto/create-question-option.dto';

@ApiTags('question-options')
@Controller('question-options')
@UseGuards(JwtAuthGuard)
export class QuestionOptionController {
  constructor(private optionService: QuestionOptionService) {}

  @Post()
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar opção',
    description: 'Cria uma nova opção para uma questão. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 201, description: 'Opção criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async create(@Body() data: CreateQuestionOptionDto) {
    return this.optionService.create(data);
  }

  @Get('question/:questionId')
  @Public()
  @ApiOperation({
    summary: 'Listar opções de uma questão',
    description: 'Retorna todas as opções de uma questão específica.',
  })
  @ApiResponse({ status: 200, description: 'Lista de opções retornada com sucesso' })
  async findByQuestion(@Param('questionId') questionId: string) {
    return this.optionService.findByQuestion(questionId);
  }

  @Get('question/:questionId/correct')
  @Public()
  @ApiOperation({
    summary: 'Listar opções corretas',
    description: 'Retorna apenas as opções corretas de uma questão.',
  })
  @ApiResponse({ status: 200, description: 'Lista de opções corretas retornada com sucesso' })
  async findCorrectOptions(@Param('questionId') questionId: string) {
    return this.optionService.findCorrectOptions(questionId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obter opção por ID',
    description: 'Retorna uma opção específica pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Opção encontrada' })
  @ApiResponse({ status: 404, description: 'Opção não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.optionService.findById(id);
  }

  @Put(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar opção',
    description: 'Atualiza os dados de uma opção. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Opção atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Opção não encontrada' })
  async update(@Param('id') id: string, @Body() data: Partial<CreateQuestionOptionDto>) {
    return this.optionService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar opção',
    description: 'Remove uma opção. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Opção deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Opção não encontrada' })
  async remove(@Param('id') id: string) {
    return this.optionService.delete(id);
  }
}
