import { QuizAttempt, QuizAttemptStatus } from './quiz-attempt.entity';

export interface IQuizAttemptRepository {
  save(attempt: QuizAttempt): Promise<QuizAttempt>;
  findById(id: string): Promise<QuizAttempt | null>;
  findByUser(userId: string): Promise<QuizAttempt[]>;
  findByQuiz(quizId: string): Promise<QuizAttempt[]>;
  findByEnrollment(enrollmentId: string): Promise<QuizAttempt[]>;
  findByUserAndQuiz(userId: string, quizId: string): Promise<QuizAttempt[]>;
  findByStatus(status: QuizAttemptStatus): Promise<QuizAttempt[]>;
  findAll(): Promise<QuizAttempt[]>;
  update(id: string, data: Partial<QuizAttempt>): Promise<QuizAttempt | null>;
  delete(id: string): Promise<void>;
  countAttemptsByUserAndQuiz(userId: string, quizId: string): Promise<number>;
}
