import type { FullAttemptResult, FullQuiz, Question, QuestionOption, Quiz, QuizAnswerInput, QuizAttemptResult, QuizAttemptSummary } from '../entities/quiz';

export interface QuizRepository {
  getFullQuizByContent(token: string, contentId: string): Promise<FullQuiz | null>;
  createQuiz(token: string, data: { contentId: string; passingScorePercentage?: number; attemptsAllowed?: number; shuffleQuestions?: boolean; timeLimitMinutes?: number }): Promise<Quiz>;
  updateQuiz(token: string, quizId: string, data: Partial<Omit<Quiz, 'id' | 'contentId'>>): Promise<Quiz>;
  createQuestion(token: string, data: { quizId: string; type: Question['type']; questionText: string; points: number; orderIndex: number }): Promise<Question>;
  updateQuestion(token: string, questionId: string, data: Partial<Pick<Question, 'questionText' | 'points' | 'orderIndex'>>): Promise<Question>;
  deleteQuestion(token: string, questionId: string): Promise<void>;
  createQuestionOption(token: string, data: { questionId: string; optionText: string; isCorrect: boolean }): Promise<QuestionOption>;
  updateQuestionOption(token: string, optionId: string, data: Partial<Pick<QuestionOption, 'optionText' | 'isCorrect'>>): Promise<QuestionOption>;
  deleteQuestionOption(token: string, optionId: string): Promise<void>;
  startQuizAttempt(token: string, quizId: string): Promise<{ id: string }>;
  submitQuizAttempt(token: string, attemptId: string, answers: QuizAnswerInput[]): Promise<QuizAttemptResult>;
  getQuizAttemptResults(token: string, attemptId: string): Promise<FullAttemptResult>;
  listMyQuizAttempts(token: string): Promise<QuizAttemptSummary[]>;
}