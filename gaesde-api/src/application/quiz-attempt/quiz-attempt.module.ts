import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizAttemptRepository, QuizAttemptSchema } from '../../infrastructure/repositories/quiz-attempt.repository.impl';
import { UserAnswerRepository, UserAnswerSchema } from '../../infrastructure/repositories/user-answer.repository.impl';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptController } from '../../presentation/controllers/attempts/quiz-attempt.controller';
import { QuizModule } from '../quiz/quiz.module';
import { QuestionModule } from '../question/question.module';
import { QuestionOptionModule } from '../question-option/question-option.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { ContentModule } from '../content/content.module';

// Importar o schema do Module
import { ModuleSchema } from '../../infrastructure/repositories/module.repository.impl';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'QuizAttempt', schema: QuizAttemptSchema },
      { name: 'UserAnswer', schema: UserAnswerSchema },
      { name: 'Module', schema: ModuleSchema }, // Adicionar o modelo Module
    ]),
    QuizModule,
    QuestionModule,
    QuestionOptionModule,
    EnrollmentModule,
    ContentModule,
  ],
  providers: [
    QuizAttemptService,
    { provide: 'IQuizAttemptRepository', useClass: QuizAttemptRepository },
    { provide: 'IUserAnswerRepository', useClass: UserAnswerRepository },
  ],
  controllers: [QuizAttemptController],
  exports: [QuizAttemptService, 'IQuizAttemptRepository', 'IUserAnswerRepository'],
})
export class QuizAttemptModule {}
