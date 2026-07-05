import { Injectable, Inject } from '@nestjs/common';
import type { IQuestionRepository } from '../../domain/question/question.repository.interface';
import type { IQuizRepository } from '../../domain/quiz/quiz.repository.interface';
import { Question, QuestionType } from '../../domain/question/question.entity';
import { 
  QuestionNotFoundException, 
  InvalidQuestionTypeException,
} from '../../domain/question/question.exceptions';
import { QuizNotFoundException } from '../../domain/quiz/quiz.exceptions';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('IQuestionRepository') private questionRepository: IQuestionRepository,
    @Inject('IQuizRepository') private quizRepository: IQuizRepository,
  ) {}

  async create(data: {
    quizId: string;
    type: QuestionType;
    questionText: string;
    points?: number;
    orderIndex?: number;
  }): Promise<any> {
    // Verificar se o quiz existe
    const quiz = await this.quizRepository.findById(data.quizId);
    if (!quiz) {
      throw new QuizNotFoundException(data.quizId);
    }

    // Validar tipo
    if (!Object.values(QuestionType).includes(data.type)) {
      throw new InvalidQuestionTypeException(data.type);
    }

    const question = new Question(
      data.quizId,
      data.type,
      data.questionText,
      data.points || 1,
      data.orderIndex || 0,
    );
    const saved = await this.questionRepository.save(question);
    return saved.toJSON();
  }

  async findById(id: string): Promise<any> {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new QuestionNotFoundException(id);
    }
    return question.toJSON();
  }

  async findByQuiz(quizId: string): Promise<any[]> {
    const questions = await this.questionRepository.findByQuiz(quizId);
    return questions.map(q => q.toJSON());
  }

  async findAll(): Promise<any[]> {
    const questions = await this.questionRepository.findAll();
    return questions.map(q => q.toJSON());
  }

  async update(id: string, data: {
    questionText?: string;
    points?: number;
    orderIndex?: number;
  }): Promise<any> {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new QuestionNotFoundException(id);
    }

    if (data.questionText) question.questionText = data.questionText;
    if (data.points !== undefined) question.points = data.points;
    if (data.orderIndex !== undefined) question.orderIndex = data.orderIndex;

    const updated = await this.questionRepository.update(id, question);
    if (!updated) {
      throw new QuestionNotFoundException(id);
    }
    return updated.toJSON();
  }

  async delete(id: string): Promise<void> {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new QuestionNotFoundException(id);
    }
    await this.questionRepository.delete(id);
  }

  async reorderQuestions(quizId: string, questionIds: string[]): Promise<void> {
    await this.questionRepository.reorderQuestions(quizId, questionIds);
  }
}
