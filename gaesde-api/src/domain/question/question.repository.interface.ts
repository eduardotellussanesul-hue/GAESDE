import { Question, QuestionType } from './question.entity';

export interface IQuestionRepository {
  save(question: Question): Promise<Question>;
  findById(id: string): Promise<Question | null>;
  findByQuiz(quizId: string): Promise<Question[]>;
  findByType(type: QuestionType): Promise<Question[]>;
  findAll(): Promise<Question[]>;
  update(id: string, data: Partial<Question>): Promise<Question | null>;
  delete(id: string): Promise<void>;
  deleteByQuiz(quizId: string): Promise<void>;
  reorderQuestions(quizId: string, questionIds: string[]): Promise<void>;
}
