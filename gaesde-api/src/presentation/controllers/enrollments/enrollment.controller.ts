import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentService } from '../../../application/enrollment/enrollment.service';
import { EnrollmentStatus } from '../../../domain/enrollment/enrollment.entity';
import { UserRoleService } from '../../../application/user-role/user-role.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { EnrollDto } from './dto/enroll.dto';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(
    private enrollmentService: EnrollmentService,
    private userRoleService: UserRoleService,
  ) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Matricular aluno',
    description: 'Matricula o usuário autenticado em um curso.',
  })
  @ApiResponse({ status: 201, description: 'Matrícula realizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Usuário já matriculado' })
  async enroll(@Body() data: EnrollDto, @Request() req) {
    const userId = req.user.userId;
    return this.enrollmentService.enroll(userId, data.courseId);
  }

  @Post('assign')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Vincular aluno a curso',
    description: 'Cria uma matrícula para um aluno específico. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 201, description: 'Matrícula criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Usuário alvo não informado' })
  async assignEnrollment(@Body() data: EnrollDto) {
    if (!data.userId) {
      throw new BadRequestException('userId is required for enrollment assignment');
    }

    return this.enrollmentService.enroll(data.userId, data.courseId);
  }

  @Get('my-enrollments')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Minhas matrículas',
    description: 'Retorna todas as matrículas do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de matrículas retornada com sucesso' })
  async getMyEnrollments(@Request() req) {
    const userId = req.user.userId;
    return this.enrollmentService.getMyEnrollments(userId);
  }

  @Post('my-enrollments/:courseId/reset-progress')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Resetar progresso do curso',
    description: 'Limpa completions, tentativas/respostas de quiz e entregas do usuário autenticado no curso informado.',
  })
  @ApiResponse({ status: 200, description: 'Progresso resetado com sucesso' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada para o curso informado' })
  async resetMyCourseProgress(@Param('courseId') courseId: string, @Request() req) {
    const userId = req.user.userId;
    return this.enrollmentService.resetMyCourseProgress(userId, courseId);
  }

  @Get('user/:userId')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar matrículas por usuário',
    description: 'Retorna as matrículas de um usuário específico. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Lista de matrículas retornada com sucesso' })
  async findByUser(@Param('userId') userId: string) {
    return this.enrollmentService.findByUser(userId);
  }

  @Get('course/:courseId')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar matrículas por curso',
    description: 'Retorna as matrículas de um curso específico. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Lista de matrículas retornada com sucesso' })
  async findByCourse(@Param('courseId') courseId: string) {
    return this.enrollmentService.findByCourse(courseId);
  }

  @Get('course/:courseId/community')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Comunidade da turma',
    description: 'Retorna professor e alunos da turma. Admin/instrutor podem ver qualquer turma; aluno precisa estar matriculado.',
  })
  @ApiResponse({ status: 200, description: 'Dados da turma retornados com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para acessar esta turma' })
  async getCourseCommunity(@Param('courseId') courseId: string, @Request() req) {
    const userId = req.user.userId;
    const [isAdmin, isInstructor] = await Promise.all([
      this.userRoleService.hasRole(userId, 'admin'),
      this.userRoleService.hasRole(userId, 'instructor'),
    ]);

    return this.enrollmentService.getCourseCommunity(userId, courseId, isAdmin || isInstructor);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter matrícula por ID',
    description: 'Retorna uma matrícula específica pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Matrícula encontrada' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.enrollmentService.findById(id);
  }

  @Post(':id/progress')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar progresso',
    description: 'Atualiza o progresso do aluno no curso.',
  })
  @ApiResponse({ status: 200, description: 'Progresso atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada' })
  async updateProgress(@Param('id') id: string) {
    return this.enrollmentService.updateProgress(id);
  }

  @Put(':id/status')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar status da matrícula',
    description: 'Altera o status da matrícula. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  async updateStatus(@Param('id') id: string, @Body() data: { status: EnrollmentStatus }) {
    return this.enrollmentService.updateStatus(id, data.status);
  }

  @Post(':id/drop')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cancelar matrícula',
    description: 'Cancela a matrícula do aluno no curso (status: dropped).',
  })
  @ApiResponse({ status: 200, description: 'Matrícula cancelada com sucesso' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada' })
  async drop(@Param('id') id: string) {
    return this.enrollmentService.drop(id);
  }

  @Post(':id/complete')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Concluir curso',
    description: 'Marca a matrícula como concluída (status: completed).',
  })
  @ApiResponse({ status: 200, description: 'Curso concluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada' })
  async complete(@Param('id') id: string) {
    return this.enrollmentService.complete(id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar matrícula',
    description: 'Remove uma matrícula. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Matrícula deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada' })
  async remove(@Param('id') id: string) {
    return this.enrollmentService.delete(id);
  }
}
