import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CertificateService } from '../../../application/certificate/certificate.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';

@ApiTags('certificates')
@Controller('certificates')
@UseGuards(JwtAuthGuard)
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  @Post('generate/:enrollmentId')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Gerar certificado',
    description: 'Gera um certificado de conclusão para uma matrícula. Apenas administradores.',
  })
  @ApiResponse({ status: 201, description: 'Certificado gerado com sucesso' })
  @ApiResponse({ status: 400, description: 'Curso não concluído' })
  @ApiResponse({ status: 409, description: 'Certificado já existe' })
  async generate(@Param('enrollmentId') enrollmentId: string) {
    return this.certificateService.generateCertificate(enrollmentId);
  }

  @Post('my-enrollments/:enrollmentId/generate')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Gerar meu certificado',
    description: 'Gera certificado para a matrícula do usuário autenticado, desde que o curso esteja concluído.',
  })
  @ApiResponse({ status: 201, description: 'Certificado gerado com sucesso' })
  @ApiResponse({ status: 403, description: 'Matrícula não pertence ao usuário autenticado' })
  @ApiResponse({ status: 400, description: 'Curso ainda não concluído' })
  async generateMyCertificate(@Param('enrollmentId') enrollmentId: string, @Request() req) {
    const userId = req.user.userId;
    return this.certificateService.generateCertificateForUser(userId, enrollmentId);
  }

  @Get('user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Meus certificados',
    description: 'Retorna todos os certificados do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de certificados retornada com sucesso' })
  async findByUser(@Request() req) {
    const userId = req.user.userId;
    return this.certificateService.findByUser(userId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter certificado por ID',
    description: 'Retorna um certificado específico pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Certificado encontrado' })
  @ApiResponse({ status: 404, description: 'Certificado não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.certificateService.findById(id);
  }

  @Get('verify/:code')
  @Public()
  @ApiOperation({
    summary: 'Verificar certificado',
    description: 'Verifica a autenticidade de um certificado pelo código de verificação. Público.',
  })
  @ApiResponse({ status: 200, description: 'Verificação realizada com sucesso' })
  async verify(@Param('code') code: string) {
    return this.certificateService.verifyCertificate(code);
  }

  @Get('code/:code')
  @Public()
  @ApiOperation({
    summary: 'Buscar certificado por código',
    description: 'Retorna os dados de um certificado pelo código de verificação. Público.',
  })
  @ApiResponse({ status: 200, description: 'Certificado encontrado' })
  @ApiResponse({ status: 404, description: 'Certificado não encontrado' })
  async findByCode(@Param('code') code: string) {
    return this.certificateService.findByVerificationCode(code);
  }
}
