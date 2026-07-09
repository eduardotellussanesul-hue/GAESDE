import type { FullAttemptResult, FullQuiz, Question, QuestionOption, Quiz, QuizAttemptResult, QuizAttemptSummary } from '../../../domain/entities/quiz';
import { asBoolean, asNullableString, asNumber, asOptionalString, asRecord, asString } from './mapperUtils';

export function mapOption(input: unknown): QuestionOption {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    questionId: asString(item.questionId),
    optionText: asString(item.optionText),
    isCorrect: asBoolean(item.isCorrect),
    createdAt: asOptionalString(item.createdAt),
  };
}

export function mapQuestion(input: unknown): Question {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    quizId: asString(item.quizId),
    type: asString(item.type) as Question['type'],
    questionText: asString(item.questionText),
    points: asNumber(item.points),
    orderIndex: asNumber(item.orderIndex),
    createdAt: asOptionalString(item.createdAt),
    updatedAt: asOptionalString(item.updatedAt),
    options: Array.isArray(item.options) ? item.options.map(mapOption) : undefined,
  };
}

export function mapQuiz(input: unknown): Quiz {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    contentId: asString(item.contentId),
    timeLimitMinutes: typeof item.timeLimitMinutes === 'number' ? item.timeLimitMinutes : null,
    passingScorePercentage: asNumber(item.passingScorePercentage, 60),
    attemptsAllowed: asNumber(item.attemptsAllowed, 1),
    shuffleQuestions: asBoolean(item.shuffleQuestions),
    createdAt: asOptionalString(item.createdAt),
    updatedAt: asOptionalString(item.updatedAt),
  };
}

export function mapFullQuiz(input: unknown): FullQuiz {
  const item = asRecord(input);
  return {
    ...mapQuiz(item),
    questions: Array.isArray(item.questions) ? item.questions.map(mapQuestion) : [],
    totalQuestions: asNumber(item.totalQuestions),
    totalPoints: asNumber(item.totalPoints),
  };
}

export function mapAttemptResult(input: unknown): QuizAttemptResult {
  const item = asRecord(input);
  return {
    attemptId: asString(item.attemptId),
    totalScore: asNumber(item.totalScore),
    isPassed: asBoolean(item.isPassed),
    totalPoints: asNumber(item.totalPoints),
    earnedPoints: asNumber(item.earnedPoints),
  };
}

export function mapQuizAttemptSummary(input: unknown): QuizAttemptSummary {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    quizId: asString(item.quizId),
    userId: asString(item.userId),
    enrollmentId: asString(item.enrollmentId),
    status: asString(item.status),
    startedAt: asOptionalString(item.startedAt),
    submittedAt: asNullableString(item.submittedAt),
    totalScore: typeof item.totalScore === 'number' ? item.totalScore : null,
    isPassed: typeof item.isPassed === 'boolean' ? item.isPassed : null,
  };
}

export function mapFullAttemptResult(input: unknown): FullAttemptResult {
  const item = asRecord(input);
  return {
    attempt: mapQuizAttemptSummary(item.attempt),
    answers: Array.isArray(item.answers)
      ? item.answers.map((answer) => {
          const answerItem = asRecord(answer);
          return {
            questionId: asString(answerItem.questionId),
            questionText: asString(answerItem.questionText),
            points: asNumber(answerItem.points),
            pointsEarned: asNumber(answerItem.pointsEarned),
            isCorrect: typeof answerItem.isCorrect === 'boolean' ? answerItem.isCorrect : null,
            selectedOptionId: asNullableString(answerItem.selectedOptionId),
            selectedOptionIds: Array.isArray(answerItem.selectedOptionIds)
              ? answerItem.selectedOptionIds.filter((value): value is string => typeof value === 'string')
              : [],
            textResponse: asNullableString(answerItem.textResponse),
            options: Array.isArray(answerItem.options)
              ? answerItem.options.map((option) => {
                  const optionItem = asRecord(option);
                  return {
                    id: asString(optionItem.id),
                    text: asString(optionItem.text),
                    isCorrect: asBoolean(optionItem.isCorrect),
                  };
                })
              : [],
          };
        })
      : [],
  };
}