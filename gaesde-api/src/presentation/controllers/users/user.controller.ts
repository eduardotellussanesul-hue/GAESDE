import { 
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, 
  Request, HttpCode, HttpStatus, UnauthorizedException, 
  UseInterceptors, UploadedFile, BadRequestException, 
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
  ForbiddenException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from '../../../application/user/user.service';
import { UserRoleService } from '../../../application/user-role/user-role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from '../../../presentation/controllers/auth/dto/login.dto';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Public } from '../../decorators/public.decorator';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private userRoleService: UserRoleService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'instructor')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta de usuário. O email deve ser único.',
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - Role admin ou instructor necessária' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@email.com' },
        password: { type: 'string', example: 'Senha@123' },
        name: { type: 'string', example: 'João Silva' },
        bio: { type: 'string', example: 'Desenvolvedor Full Stack' },
        file: { type: 'string', format: 'binary', description: 'Avatar (opcional)' },
      },
    },
  })
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    if (file) {
      const { url } = await this.userService.uploadFileToCloudinary(file);
      createUserDto['avatarUrl'] = url;
    }
    
    return this.userService.create(createUserDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login do usuário',
    description: 'Autentica o usuário e retorna o token JWT.',
  })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    if (!result.success) {
      throw new UnauthorizedException(result.message);
    }
    
    return this.authService.login(result.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Atualiza os dados do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'João Silva Santos' },
        bio: { type: 'string', example: 'Tech Lead com 10 anos de experiência' },
        file: { type: 'string', format: 'binary', description: 'Novo avatar (opcional)' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    
    // Verificar se é admin ou se está atualizando a própria conta
    const isAdmin = await this.userRoleService.hasRole(userId, 'admin');
    if (userId !== id && !isAdmin) {
      throw new ForbiddenException('Você só pode atualizar sua própria conta');
    }

    if (file) {
      const user = await this.userService.findById(id);
      if (user && user.avatarUrl) {
        await this.userService.deleteCloudinaryFile(user.avatarUrl);
      }
      
      const { url } = await this.userService.uploadFileToCloudinary(file);
      updateUserDto['avatarUrl'] = url;
    }
    
    return this.userService.update(id, updateUserDto);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload de avatar',
    description: 'Faz upload de uma imagem para o avatar do usuário.',
  })
  @ApiResponse({ status: 200, description: 'Avatar atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Imagem do avatar' },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }
    
    const userId = req.user.userId;
    return this.userService.uploadAvatar(userId, file);
  }

  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verificar email',
    description: 'Marca o email do usuário como verificado.',
  })
  @ApiResponse({ status: 200, description: 'Email verificado com sucesso' })
  async verifyEmail(@Request() req) {
    return this.userService.verifyEmail(req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna a lista de todos os usuários. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - Role admin necessária' })
  async findAll() {
    return this.userService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter perfil do usuário logado',
    description: 'Retorna os dados do usuário autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getProfile(@Request() req) {
    return this.userService.findById(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter usuário por ID',
    description: 'Retorna os dados de um usuário específico. Admins podem visualizar qualquer perfil.',
  })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    
    // Verificar se é admin ou se está visualizando sua própria conta
    const isAdmin = await this.userRoleService.hasRole(userId, 'admin');
    if (userId !== id && !isAdmin) {
      throw new ForbiddenException('Você só pode visualizar seu próprio perfil');
    }
    
    return this.userService.findById(id);
  }

  @Post('restore/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Restaurar usuário',
    description: 'Restaura um usuário que foi deletado (soft delete). Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Usuário restaurado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - Role admin necessária' })
  async restore(@Param('id') id: string) {
    return this.userService.restore(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar usuário (soft delete)',
    description: 'Marca o usuário como deletado (soft delete).',
  })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    
    // Verificar se é admin ou se está deletando a própria conta
    const isAdmin = await this.userRoleService.hasRole(userId, 'admin');
    if (userId !== id && !isAdmin) {
      throw new ForbiddenException('Você só pode deletar sua própria conta');
    }
    
    return this.userService.delete(id);
  }

  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar usuário permanentemente',
    description: 'Remove o usuário do banco de dados. Apenas administradores.',
  })
  @ApiResponse({ status: 200, description: 'Usuário removido permanentemente' })
  @ApiResponse({ status: 403, description: 'Acesso negado - Role admin necessária' })
  async hardRemove(@Param('id') id: string) {
    return this.userService.hardDelete(id);
  }
}
