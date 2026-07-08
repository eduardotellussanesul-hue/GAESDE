export type Quiz = {
  id: string;
  contentId: string;
  timeLimitMinutes?: number | null;
  passingScorePercentage: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type QuestionType = 'multiple_choice' | 'true_false' | 'essay' | 'matching';

export type QuestionOption = {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  createdAt?: string;
};

export type Question = {
  id: string;
  quizId: string;
  type: QuestionType;
  questionText: string;
  points: number;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
  options?: QuestionOption[];
};

export type FullQuiz = Quiz & {
  questions: Question[];
  totalQuestions: number;
  totalPoints: number;
};

export type QuizAnswerInput = {
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  textResponse?: string;
};

export type QuizAttemptResult = {
  attemptId: string;
  totalScore: number;
  isPassed: boolean;
  totalPoints: number;
  earnedPoints: number;
};

export type AttemptAnswerResult = {
  questionId: string;
  questionText: string;
  points: number;
  pointsEarned: number;
  isCorrect: boolean | null;
  selectedOptionId: string | null;
  selectedOptionIds: string[];
  textResponse: string | null;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
};

export type FullAttemptResult = {
  attempt: {
    id: string;
    quizId: string;
    userId: string;
    enrollmentId: string;
    status: string;
    startedAt?: string;
    submittedAt?: string | null;
    totalScore?: number | null;
    isPassed?: boolean | null;
  };
  answers: AttemptAnswerResult[];
};