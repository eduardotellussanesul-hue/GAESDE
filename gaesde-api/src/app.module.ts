import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { CloudinaryModule } from './infrastructure/cloudinary/cloudinary.module';
import { UserModule } from './application/user/user.module';
import { ImageModule } from './application/image/image.module';
import { RoleModule } from './application/role/role.module';
import { UserRoleModule } from './application/user-role/user-role.module';
import { CategoryModule } from './application/category/category.module';
import { CourseModule } from './application/course/course.module';
import { ModuleModule } from './application/module/module.module';
import { ContentModule } from './application/content/content.module';
import { EnrollmentModule } from './application/enrollment/enrollment.module';
import { ContentCompletionModule } from './application/content-completion/content-completion.module';
import { QuizModule } from './application/quiz/quiz.module';
import { QuestionModule } from './application/question/question.module';
import { QuestionOptionModule } from './application/question-option/question-option.module';
import { QuizAttemptModule } from './application/quiz-attempt/quiz-attempt.module';
import { UserAnswerModule } from './application/user-answer/user-answer.module';
import { AssignmentSubmissionModule } from './application/assignment-submission/assignment-submission.module';
import { ReviewModule } from './application/review/review.module';
import { CertificateModule } from './application/certificate/certificate.module';
import { JwtAuthGuard } from './infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/auth/guards/roles.guard';
import { HealthController } from './presentation/controllers/health/health.controller';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    CloudinaryModule,
    UserModule,
    ImageModule,
    RoleModule,
    UserRoleModule,
    CategoryModule,
    CourseModule,
    ModuleModule,
    ContentModule,
    EnrollmentModule,
    ContentCompletionModule,
    QuizModule,
    QuestionModule,
    QuestionOptionModule,
    QuizAttemptModule,
    UserAnswerModule,
    AssignmentSubmissionModule,
    ReviewModule,
    CertificateModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
