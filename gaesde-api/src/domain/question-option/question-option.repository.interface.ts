import { QuestionOption } from './question-option.entity';

export interface IQuestionOptionRepository {
  save(option: QuestionOption): Promise<QuestionOption>;
  findById(id: string): Promise<QuestionOption | null>;
  findByQuestion(questionId: string): Promise<QuestionOption[]>;
  findCorrectOptions(questionId: string): Promise<QuestionOption[]>;
  findAll(): Promise<QuestionOption[]>;
  update(id: string, data: Partial<QuestionOption>): Promise<QuestionOption | null>;
  delete(id: string): Promise<void>;
  deleteByQuestion(questionId: string): Promise<void>;
}
