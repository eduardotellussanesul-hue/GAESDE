import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizRepository, QuizSchema } from '../../infrastructure/repositories/quiz.repository.impl';
import { QuestionRepository, QuestionSchema } from '../../infrastructure/repositories/question.repository.impl';
import { QuestionOptionRepository, QuestionOptionSchema } from '../../infrastructure/repositories/question-option.repository.impl';
import { QuizService } from './quiz.service';
import { QuizController } from '../../presentation/controllers/quizzes/quiz.controller';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Quiz', schema: QuizSchema },
      { name: 'Question', schema: QuestionSchema },
      { name: 'QuestionOption', schema: QuestionOptionSchema },
    ]),
    ContentModule,
  ],
  providers: [
    QuizService,
    { provide: 'IQuizRepository', useClass: QuizRepository },
    { provide: 'IQuestionRepository', useClass: QuestionRepository },
    { provide: 'IQuestionOptionRepository', useClass: QuestionOptionRepository },
  ],
  controllers: [QuizController],
  exports: [QuizService, 'IQuizRepository', 'IQuestionRepository', 'IQuestionOptionRepository'],
})
export class QuizModule {}
