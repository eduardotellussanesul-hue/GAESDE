import { Injectable, Inject } from '@nestjs/common';
import type { IQuizRepository } from '../../domain/quiz/quiz.repository.interface';
import type { IContentRepository } from '../../domain/content/content.repository.interface';
import type { IQuestionRepository } from '../../domain/question/question.repository.interface';
import type { IQuestionOptionRepository } from '../../domain/question-option/question-option.repository.interface';
import { Quiz } from '../../domain/quiz/quiz.entity';
import { 
  QuizNotFoundException, 
  QuizAlreadyExistsException,
} from '../../domain/quiz/quiz.exceptions';
import { ContentNotFoundException } from '../../domain/content/content.exceptions';

@Injectable()
export class QuizService {
  constructor(
    @Inject('IQuizRepository') private quizRepository: IQuizRepository,
    @Inject('IContentRepository') private contentRepository: IContentRepository,
    @Inject('IQuestionRepository') private questionRepository: IQuestionRepository,
    @Inject('IQuestionOptionRepository') private optionRepository: IQuestionOptionRepository,
  ) {}

  async create(data: {
    contentId: string;
    passingScorePercentage?: number;
    attemptsAllowed?: number;
    shuffleQuestions?: boolean;
    timeLimitMinutes?: number;
  }): Promise<any> {
    const content = await this.contentRepository.findContentById(data.contentId);
    if (!content) {
      throw new ContentNotFoundException(data.contentId);
    }

    const existing = await this.quizRepository.findByContent(data.contentId);
    if (existing) {
      throw new QuizAlreadyExistsException(data.contentId);
    }

    const quiz = new Quiz(
      data.contentId,
      data.passingScorePercentage || 60,
      data.attemptsAllowed || 1,
      data.shuffleQuestions || false,
      data.timeLimitMinutes,
    );
    const saved = await this.quizRepository.save(quiz);
    return this.mapToResponse(saved);
  }

  async findById(id: string): Promise<any> {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) {
      throw new QuizNotFoundException(id);
    }
    return this.mapToResponse(quiz);
  }

  async findByContent(contentId: string): Promise<any> {
    const quiz = await this.quizRepository.findByContent(contentId);
    if (!quiz) {
      return null;
    }
    return this.mapToResponse(quiz);
  }

  async findAll(): Promise<any[]> {
    const quizzes = await this.quizRepository.findAll();
    return quizzes.map(q => this.mapToResponse(q));
  }

  async update(id: string, data: {
    passingScorePercentage?: number;
    attemptsAllowed?: number;
    shuffleQuestions?: boolean;
    timeLimitMinutes?: number;
  }): Promise<any> {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) {
      throw new QuizNotFoundException(id);
    }

    if (data.passingScorePercentage !== undefined) quiz.passingScorePercentage = data.passingScorePercentage;
    if (data.attemptsAllowed !== undefined) quiz.attemptsAllowed = data.attemptsAllowed;
    if (data.shuffleQuestions !== undefined) quiz.shuffleQuestions = data.shuffleQuestions;
    if (data.timeLimitMinutes !== undefined) quiz.timeLimitMinutes = data.timeLimitMinutes;

    const updated = await this.quizRepository.update(id, quiz);
    if (!updated) {
      throw new QuizNotFoundException(id);
    }
    return this.mapToResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) {
      throw new QuizNotFoundException(id);
    }
    await this.quizRepository.delete(id);
  }

  async getFullQuiz(contentId: string): Promise<any> {
    const quiz = await this.quizRepository.findByContent(contentId);
    if (!quiz) {
      return null;
    }

    const questions = await this.questionRepository.findByQuiz(quiz.id);
    const questionsWithOptions = await Promise.all(questions.map(async (q) => {
      const options = await this.optionRepository.findByQuestion(q.id);
      return {
        ...q.toJSON(),
        options: options.map(o => o.toJSON()),
      };
    }));

    return {
      ...this.mapToResponse(quiz),
      questions: questionsWithOptions,
      totalQuestions: questions.length,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
    };
  }

  private mapToResponse(quiz: Quiz): any {
    return quiz.toJSON();
  }
}
