import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from '../../../application/content/content.service';
import { ContentType } from '../../../domain/content/content.entity';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Public } from '../../decorators/public.decorator';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { CreateTextDto } from './dto/create-text.dto';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { ReorderDto } from '../modules/dto/reorder.dto';

@ApiTags('contents')
@Controller('contents')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Post()
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar conteúdo',
    description: 'Cria um novo conteúdo em um módulo. Tipos: video, text, pdf, quiz, assignment.',
  })
  @ApiResponse({ status: 201, description: 'Conteúdo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createContent(@Body() data: CreateContentDto) {
    return this.contentService.createContent(data);
  }

  @Get()
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar conteúdos',
    description: 'Retorna todos os conteúdos. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Lista de conteúdos retornada com sucesso' })
  async findAllContents() {
    return this.contentService.findAllContents();
  }

  @Get('module/:moduleId')
  @Public()
  @ApiOperation({
    summary: 'Listar conteúdos de um módulo',
    description: 'Retorna todos os conteúdos de um módulo específico.',
  })
  @ApiResponse({ status: 200, description: 'Lista de conteúdos retornada com sucesso' })
  async findContentsByModule(@Param('moduleId') moduleId: string) {
    return this.contentService.findContentsByModule(moduleId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obter conteúdo por ID',
    description: 'Retorna um conteúdo específico pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Conteúdo encontrado' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async findContentById(@Param('id') id: string) {
    return this.contentService.findContentById(id);
  }

  @Get(':id/full')
  @Public()
  @ApiOperation({
    summary: 'Obter conteúdo completo',
    description: 'Retorna o conteúdo com seus dados específicos (vídeo, texto, PDF).',
  })
  @ApiResponse({ status: 200, description: 'Conteúdo completo retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async getFullContent(@Param('id') id: string) {
    return this.contentService.getFullContent(id);
  }

  @Put(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar conteúdo',
    description: 'Atualiza os dados de um conteúdo. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Conteúdo atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async updateContent(@Param('id') id: string, @Body() data: UpdateContentDto) {
    return this.contentService.updateContent(id, data);
  }

  @Post('reorder')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reordenar conteúdos',
    description: 'Altera a ordem dos conteúdos de um módulo.',
  })
  @ApiResponse({ status: 200, description: 'Conteúdos reordenados com sucesso' })
  async reorderContents(@Body() data: ReorderDto) {
    return this.contentService.reorderContents(data.parentId, data.ids);
  }

  @Delete(':id')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar conteúdo',
    description: 'Remove um conteúdo. Requer role instructor ou admin.',
  })
  @ApiResponse({ status: 200, description: 'Conteúdo deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async deleteContent(@Param('id') id: string) {
    return this.contentService.deleteContent(id);
  }

  @Post(':contentId/video')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Adicionar vídeo ao conteúdo',
    description: 'Adiciona os dados de vídeo a um conteúdo do tipo video.',
  })
  @ApiResponse({ status: 201, description: 'Vídeo adicionado com sucesso' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async createVideo(@Param('contentId') contentId: string, @Body() data: CreateVideoDto) {
    return this.contentService.createVideo(contentId, data);
  }

  @Get(':contentId/video')
  @Public()
  @ApiOperation({
    summary: 'Obter vídeo do conteúdo',
    description: 'Retorna os dados de vídeo de um conteúdo.',
  })
  @ApiResponse({ status: 200, description: 'Vídeo encontrado' })
  @ApiResponse({ status: 404, description: 'Vídeo não encontrado' })
  async getVideo(@Param('contentId') contentId: string) {
    return this.contentService.findVideoByContent(contentId);
  }

  @Put(':contentId/video')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar vídeo do conteúdo',
    description: 'Atualiza os dados de vídeo de um conteúdo.',
  })
  @ApiResponse({ status: 200, description: 'Vídeo atualizado com sucesso' })
  async updateVideo(@Param('contentId') contentId: string, @Body() data: CreateVideoDto) {
    return this.contentService.updateVideo(contentId, data);
  }

  @Post(':contentId/text')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Adicionar texto ao conteúdo',
    description: 'Adiciona o corpo de texto a um conteúdo do tipo text.',
  })
  @ApiResponse({ status: 201, description: 'Texto adicionado com sucesso' })
  async createText(@Param('contentId') contentId: string, @Body() data: CreateTextDto) {
    return this.contentService.createText(contentId, data);
  }

  @Get(':contentId/text')
  @Public()
  @ApiOperation({
    summary: 'Obter texto do conteúdo',
    description: 'Retorna o corpo de texto de um conteúdo.',
  })
  @ApiResponse({ status: 200, description: 'Texto encontrado' })
  @ApiResponse({ status: 404, description: 'Texto não encontrado' })
  async getText(@Param('contentId') contentId: string) {
    return this.contentService.findTextByContent(contentId);
  }

  @Put(':contentId/text')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar texto do conteúdo',
    description: 'Atualiza o corpo de texto de um conteúdo.',
  })
  @ApiResponse({ status: 200, description: 'Texto atualizado com sucesso' })
  async updateText(@Param('contentId') contentId: string, @Body() data: CreateTextDto) {
    return this.contentService.updateText(contentId, data);
  }

  @Post(':contentId/pdf')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Adicionar PDF ao conteúdo',
    description: 'Adiciona os dados de PDF a um conteúdo do tipo pdf.',
  })
  @ApiResponse({ status: 201, description: 'PDF adicionado com sucesso' })
  async createPdf(@Param('contentId') contentId: string, @Body() data: CreatePdfDto) {
    return this.contentService.createPdf(contentId, data);
  }

  @Get(':contentId/pdf')
  @Public()
  @ApiOperation({
    summary: 'Obter PDF do conteúdo',
    description: 'Retorna os dados de PDF de um conteúdo.',
  })
  @ApiResponse({ status: 200, description: 'PDF encontrado' })
  @ApiResponse({ status: 404, description: 'PDF não encontrado' })
  async getPdf(@Param('contentId') contentId: string) {
    return this.contentService.findPdfByContent(contentId);
  }

  @Put(':contentId/pdf')
  @Roles('admin', 'instructor')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar PDF do conteúdo',
    description: 'Atualiza os dados de PDF de um conteúdo.',
  })
  @ApiResponse({ status: 200, description: 'PDF atualizado com sucesso' })
  async updatePdf(@Param('contentId') contentId: string, @Body() data: CreatePdfDto) {
    return this.contentService.updatePdf(contentId, data);
  }
}
