import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionRepository, QuestionSchema } from '../../infrastructure/repositories/question.repository.impl';
import { QuestionService } from './question.service';
import { QuestionController } from '../../presentation/controllers/quizzes/question.controller';
import { QuizModule } from '../quiz/quiz.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Question', schema: QuestionSchema }]),
    forwardRef(() => QuizModule),
  ],
  providers: [
    QuestionService,
    { provide: 'IQuestionRepository', useClass: QuestionRepository },
  ],
  controllers: [QuestionController],
  exports: [QuestionService, 'IQuestionRepository'],
})
export class QuestionModule {}
