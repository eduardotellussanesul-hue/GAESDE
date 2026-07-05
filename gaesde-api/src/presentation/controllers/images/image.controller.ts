import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from '../../../application/image/image.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';

@ApiTags('images')
@Controller('images')
@UseGuards(JwtAuthGuard)
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post('upload')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload de imagem',
    description: 'Faz upload de uma imagem para o Cloudinary.',
  })
  @ApiResponse({ status: 201, description: 'Imagem enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Arquivo de imagem' },
      },
    },
  })
  async upload(@UploadedFile() file: Express.Multer.File, @Request() req) {
    const userId = req.user.userId;
    return this.imageService.upload(file, userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar imagens',
    description: 'Retorna todas as imagens do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de imagens retornada com sucesso' })
  async findAll() {
    return this.imageService.findAll();
  }

  @Get('my-images')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Minhas imagens',
    description: 'Retorna todas as imagens do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de imagens retornada com sucesso' })
  async findByUser(@Request() req) {
    return this.imageService.findByUser(req.user.userId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter imagem por ID',
    description: 'Retorna uma imagem específica pelo ID.',
  })
  @ApiResponse({ status: 200, description: 'Imagem encontrada' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.imageService.findById(id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar imagem',
    description: 'Remove uma imagem do Cloudinary e do banco de dados.',
  })
  @ApiResponse({ status: 200, description: 'Imagem deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  async remove(@Param('id') id: string) {
    return this.imageService.delete(id);
  }
}
