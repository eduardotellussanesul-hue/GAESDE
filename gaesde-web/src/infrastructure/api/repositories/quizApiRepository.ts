import type { FullAttemptResult, FullQuiz, Question, QuestionOption, Quiz, QuizAnswerInput, QuizAttemptResult } from '../../../domain/entities/quiz';
import type { QuizRepository } from '../../../domain/repositories/quizRepository';
import { apiClient } from '../client';
import { asRecord, asString } from '../mappers/mapperUtils';
import { mapAttemptResult, mapFullAttemptResult, mapFullQuiz, mapOption, mapQuestion, mapQuiz } from '../mappers/quizMapper';

export class QuizApiRepository implements QuizRepository {
  async getFullQuizByContent(token: string, contentId: string): Promise<FullQuiz | null> {
    const response = await apiClient.request(`/quizzes/content/${contentId}/full`, { method: 'GET', authToken: token });
    return response ? mapFullQuiz(response) : null;
  }

  async createQuiz(token: string, data: { contentId: string; passingScorePercentage?: number; attemptsAllowed?: number; shuffleQuestions?: boolean; timeLimitMinutes?: number }): Promise<Quiz> {
    const response = await apiClient.request('/quizzes', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapQuiz(response);
  }

  async updateQuiz(token: string, quizId: string, data: Partial<Omit<Quiz, 'id' | 'contentId'>>): Promise<Quiz> {
    const response = await apiClient.request(`/quizzes/${quizId}`, {
      method: 'PUT',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapQuiz(response);
  }

  async createQuestion(token: string, data: { quizId: string; type: Question['type']; questionText: string; points: number; orderIndex: number }): Promise<Question> {
    const response = await apiClient.request('/questions', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapQuestion(response);
  }

  async updateQuestion(token: string, questionId: string, data: Partial<Pick<Question, 'questionText' | 'points' | 'orderIndex'>>): Promise<Question> {
    const response = await apiClient.request(`/questions/${questionId}`, {
      method: 'PUT',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapQuestion(response);
  }

  async deleteQuestion(token: string, questionId: string): Promise<void> {
    await apiClient.request(`/questions/${questionId}`, { method: 'DELETE', authToken: token });
  }

  async createQuestionOption(token: string, data: { questionId: string; optionText: string; isCorrect: boolean }): Promise<QuestionOption> {
    const response = await apiClient.request('/question-options', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapOption(response);
  }

  async updateQuestionOption(token: string, optionId: string, data: Partial<Pick<QuestionOption, 'optionText' | 'isCorrect'>>): Promise<QuestionOption> {
    const response = await apiClient.request(`/question-options/${optionId}`, {
      method: 'PUT',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapOption(response);
  }

  async deleteQuestionOption(token: string, optionId: string): Promise<void> {
    await apiClient.request(`/question-options/${optionId}`, { method: 'DELETE', authToken: token });
  }

  async startQuizAttempt(token: string, quizId: string): Promise<{ id: string }> {
    const response = await apiClient.request(`/quiz-attempts/start/${quizId}`, { method: 'POST', authToken: token });
    return { id: asString(asRecord(response).id) };
  }

  async submitQuizAttempt(token: string, attemptId: string, answers: QuizAnswerInput[]): Promise<QuizAttemptResult> {
    const response = await apiClient.request(`/quiz-attempts/submit/${attemptId}`, {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ answers }),
    });
    return mapAttemptResult(response);
  }

  async getQuizAttemptResults(token: string, attemptId: string): Promise<FullAttemptResult> {
    const response = await apiClient.request(`/quiz-attempts/${attemptId}/results`, { method: 'GET', authToken: token });
    return mapFullAttemptResult(response);
  }
}