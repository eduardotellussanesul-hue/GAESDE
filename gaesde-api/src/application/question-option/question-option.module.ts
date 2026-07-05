import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionOptionRepository, QuestionOptionSchema } from '../../infrastructure/repositories/question-option.repository.impl';
import { QuestionOptionService } from './question-option.service';
import { QuestionOptionController } from '../../presentation/controllers/quizzes/question-option.controller';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'QuestionOption', schema: QuestionOptionSchema }]),
    QuestionModule,
  ],
  providers: [
    QuestionOptionService,
    { provide: 'IQuestionOptionRepository', useClass: QuestionOptionRepository },
  ],
  controllers: [QuestionOptionController],
  exports: [QuestionOptionService],
})
export class QuestionOptionModule {}
