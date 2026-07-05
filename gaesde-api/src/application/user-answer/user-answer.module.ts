import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAnswerRepository, UserAnswerSchema } from '../../infrastructure/repositories/user-answer.repository.impl';
import { UserAnswerService } from './user-answer.service';
import { UserAnswerController } from '../../presentation/controllers/attempts/user-answer.controller';
import { QuizAttemptModule } from '../quiz-attempt/quiz-attempt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'UserAnswer', schema: UserAnswerSchema }]),
    QuizAttemptModule, // Importar para ter acesso ao IQuizAttemptRepository
  ],
  providers: [
    UserAnswerService,
    { provide: 'IUserAnswerRepository', useClass: UserAnswerRepository },
  ],
  controllers: [UserAnswerController],
  exports: [UserAnswerService],
})
export class UserAnswerModule {}
