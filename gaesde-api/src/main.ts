import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  app.enableCors();

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('GAESDE API - Gestão de Cursos Online')
    .setDescription(`
      ## API completa para plataforma de cursos online

      ### Funcionalidades implementadas:

      **1. Autenticação e Usuários**
      - Registro e login de usuários
      - JWT Token para autenticação
      - Roles: Admin, Instructor, Student

      **2. Catálogo de Cursos**
      - Categorias (hierárquicas)
      - Cursos (com status: draft, review, published, archived)
      - Módulos (ordenáveis)
      - Conteúdos (video, text, pdf, quiz, assignment)

      **3. Jornada do Aluno**
      - Matrículas em cursos
      - Progresso automático
      - Completions de conteúdos
      - Certificados (geração em PDF/HTML)

      **4. Avaliações**
      - Quizzes com questões (multiple_choice, true_false, essay)
      - Tentativas e submissões
      - Reviews (1-5 estrelas)

      **5. Recursos Adicionais**
      - Upload de arquivos (Cloudinary)
      - Assignment Submissions
      - Verificação de certificados

      ### Autenticação:
      Use o botão **Authorize** (🔒) acima para informar o token JWT.
      Token padrão: \`Bearer {seu_token}\`
    `)
    .setVersion('1.0.0')
    .setContact(
      'GAESDE Team',
      'https://github.com/gaesde',
      'suporte@gaesde.com',
    )
    .setLicense(
      'MIT',
      'https://opensource.org/licenses/MIT',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Informe o token JWT para autenticação',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticação e gerenciamento de usuários')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('roles', 'Gerenciamento de papéis e permissões')
    .addTag('categories', 'Gerenciamento de categorias')
    .addTag('courses', 'Gerenciamento de cursos')
    .addTag('modules', 'Gerenciamento de módulos')
    .addTag('contents', 'Gerenciamento de conteúdos')
    .addTag('enrollments', 'Matrículas e progresso')
    .addTag('completions', 'Conclusão de conteúdos')
    .addTag('quizzes', 'Gerenciamento de quizzes')
    .addTag('questions', 'Gerenciamento de questões')
    .addTag('question-options', 'Gerenciamento de opções')
    .addTag('quiz-attempts', 'Tentativas de quizzes')
    .addTag('user-answers', 'Respostas dos usuários')
    .addTag('reviews', 'Avaliações de cursos')
    .addTag('certificates', 'Certificados de conclusão')
    .addTag('assignment-submissions', 'Submissões de assignments')
    .addTag('health', 'Health check da aplicação')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Configurar opções da UI
  const options = {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #4A90D9 }
      .swagger-ui .info .title small { font-size: 12px }
    `,
    customSiteTitle: 'GAESDE API - Documentação',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  };

  SwaggerModule.setup('api/docs', app, document, options);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 Swagger available at: http://localhost:${port}/api/docs`);
  console.log(`📖 API JSON: http://localhost:${port}/api/docs-json`);
}
bootstrap();
