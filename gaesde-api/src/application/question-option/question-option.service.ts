import { Injectable, Inject } from '@nestjs/common';
import type { IQuestionOptionRepository } from '../../domain/question-option/question-option.repository.interface';
import type { IQuestionRepository } from '../../domain/question/question.repository.interface';
import { QuestionOption } from '../../domain/question-option/question-option.entity';
import { 
  QuestionOptionNotFoundException,
} from '../../domain/question-option/question-option.exceptions';
import { QuestionNotFoundException } from '../../domain/question/question.exceptions';

@Injectable()
export class QuestionOptionService {
  constructor(
    @Inject('IQuestionOptionRepository') private optionRepository: IQuestionOptionRepository,
    @Inject('IQuestionRepository') private questionRepository: IQuestionRepository,
  ) {}

  async create(data: {
    questionId: string;
    optionText: string;
    isCorrect?: boolean;
  }): Promise<any> {
    // Verificar se a questão existe
    const question = await this.questionRepository.findById(data.questionId);
    if (!question) {
      throw new QuestionNotFoundException(data.questionId);
    }

    const option = new QuestionOption(
      data.questionId,
      data.optionText,
      data.isCorrect || false,
    );
    const saved = await this.optionRepository.save(option);
    return saved.toJSON();
  }

  async findById(id: string): Promise<any> {
    const option = await this.optionRepository.findById(id);
    if (!option) {
      throw new QuestionOptionNotFoundException(id);
    }
    return option.toJSON();
  }

  async findByQuestion(questionId: string): Promise<any[]> {
    const options = await this.optionRepository.findByQuestion(questionId);
    return options.map(o => o.toJSON());
  }

  async findCorrectOptions(questionId: string): Promise<any[]> {
    const options = await this.optionRepository.findCorrectOptions(questionId);
    return options.map(o => o.toJSON());
  }

  async update(id: string, data: {
    optionText?: string;
    isCorrect?: boolean;
  }): Promise<any> {
    const option = await this.optionRepository.findById(id);
    if (!option) {
      throw new QuestionOptionNotFoundException(id);
    }

    if (data.optionText) option.optionText = data.optionText;
    if (data.isCorrect !== undefined) option.isCorrect = data.isCorrect;

    const updated = await this.optionRepository.update(id, option);
    if (!updated) {
      throw new QuestionOptionNotFoundException(id);
    }
    return updated.toJSON();
  }

  async delete(id: string): Promise<void> {
    const option = await this.optionRepository.findById(id);
    if (!option) {
      throw new QuestionOptionNotFoundException(id);
    }
    await this.optionRepository.delete(id);
  }

  async deleteByQuestion(questionId: string): Promise<void> {
    await this.optionRepository.deleteByQuestion(questionId);
  }
}
