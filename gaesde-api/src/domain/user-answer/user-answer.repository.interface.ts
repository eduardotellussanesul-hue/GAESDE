import { UserAnswer } from './user-answer.entity';

export interface IUserAnswerRepository {
  save(answer: UserAnswer): Promise<UserAnswer>;
  findById(id: string): Promise<UserAnswer | null>;
  findByAttempt(attemptId: string): Promise<UserAnswer[]>;
  findByQuestion(questionId: string): Promise<UserAnswer[]>;
  findByAttemptAndQuestion(attemptId: string, questionId: string): Promise<UserAnswer | null>;
  findAll(): Promise<UserAnswer[]>;
  update(id: string, data: Partial<UserAnswer>): Promise<UserAnswer | null>;
  delete(id: string): Promise<void>;
  deleteByAttempt(attemptId: string): Promise<void>;
}
