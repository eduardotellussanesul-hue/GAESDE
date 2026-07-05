import { Injectable, Inject } from '@nestjs/common';
import type { IUserAnswerRepository } from '../../domain/user-answer/user-answer.repository.interface';
import { UserAnswer } from '../../domain/user-answer/user-answer.entity';
import { UserAnswerNotFoundException } from '../../domain/user-answer/user-answer.exceptions';

@Injectable()
export class UserAnswerService {
  constructor(
    @Inject('IUserAnswerRepository') private answerRepository: IUserAnswerRepository,
  ) {}

  async findById(id: string): Promise<any> {
    const answer = await this.answerRepository.findById(id);
    if (!answer) {
      throw new UserAnswerNotFoundException(id);
    }
    return answer.toJSON();
  }

  async findByAttempt(attemptId: string): Promise<any[]> {
    const answers = await this.answerRepository.findByAttempt(attemptId);
    return answers.map(a => a.toJSON());
  }

  async findByQuestion(questionId: string): Promise<any[]> {
    const answers = await this.answerRepository.findByQuestion(questionId);
    return answers.map(a => a.toJSON());
  }

  async updateAnswer(id: string, data: {
    pointsEarned?: number;
    isCorrect?: boolean;
  }): Promise<any> {
    const answer = await this.answerRepository.findById(id);
    if (!answer) {
      throw new UserAnswerNotFoundException(id);
    }

    if (data.pointsEarned !== undefined) answer.pointsEarned = data.pointsEarned;
    if (data.isCorrect !== undefined) answer.isCorrect = data.isCorrect;

    const updated = await this.answerRepository.update(id, answer);
    return updated.toJSON();
  }

  async delete(id: string): Promise<void> {
    const answer = await this.answerRepository.findById(id);
    if (!answer) {
      throw new UserAnswerNotFoundException(id);
    }
    await this.answerRepository.delete(id);
  }
}
