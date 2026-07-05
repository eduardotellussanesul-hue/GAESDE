import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentSubmissionService } from '../../../application/assignment-submission/assignment-submission.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';

@ApiTags('assignment-submissions')
@Controller('assignment-submissions')
@UseGuards(JwtAuthGuard)
export class AssignmentSubmissionController {
  constructor(private submissionService: AssignmentSubmissionService) {}

  @Post('submit/:contentId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Submeter assignment',
    description: 'Submete um arquivo para um assignment.',
  })
  @ApiResponse({ status: 201, description: 'Submissão realizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Assignment já submetido' })
  async submit(
    @Param('contentId') contentId: string,
    @Body() data: SubmitAssignmentDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.submissionService.submit(userId, contentId, data.fileUrl);
  }

  @Get('user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Minhas submissões',
    description: 'Retorna todas as submissões do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de submissões retornada com sucesso' })
  async findByUser(@Request() req) {
    const userId = req.user.userId;
    return this.submissionService.findByUser(userId);
  }

  @Get('content/:contentId')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar submissões por conteúdo',
    description: 'Retorna as submissões de um assignment. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Lista de submissões retornada com sucesso' })
  async findByContent(@Param('contentId') contentId: string) {
    return this.submissionService.findByContent(contentId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter submissão por ID',
    description: 'Retorna uma submissão específica pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Submissão encontrada' })
  @ApiResponse({ status: 404, description: 'Submissão não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.submissionService.findById(id);
  }

  @Put(':id/grade')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Corrigir submissão',
    description: 'Atribui uma nota e feedback a uma submissão. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Submissão corrigida com sucesso' })
  @ApiResponse({ status: 400, description: 'Nota inválida' })
  @ApiResponse({ status: 404, description: 'Submissão não encontrada' })
  async grade(
    @Param('id') id: string,
    @Body() data: GradeAssignmentDto,
  ) {
    return this.submissionService.gradeSubmission(id, data.grade, data.feedback);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar submissão',
    description: 'Remove uma submissão. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Submissão deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Submissão não encontrada' })
  async remove(@Param('id') id: string) {
    return this.submissionService.delete(id);
  }
}
