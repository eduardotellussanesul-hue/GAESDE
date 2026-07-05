import { Quiz } from './quiz.entity';

export interface IQuizRepository {
  save(quiz: Quiz): Promise<Quiz>;
  findById(id: string): Promise<Quiz | null>;
  findByContent(contentId: string): Promise<Quiz | null>;
  findAll(): Promise<Quiz[]>;
  update(id: string, data: Partial<Quiz>): Promise<Quiz | null>;
  delete(id: string): Promise<void>;
}
