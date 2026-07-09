import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { IQuizAttemptRepository } from '../../domain/quiz-attempt/quiz-attempt.repository.interface';
import type { IQuizRepository } from '../../domain/quiz/quiz.repository.interface';
import type { IQuestionRepository } from '../../domain/question/question.repository.interface';
import type { IUserAnswerRepository } from '../../domain/user-answer/user-answer.repository.interface';
import type { IQuestionOptionRepository } from '../../domain/question-option/question-option.repository.interface';
import type { IEnrollmentRepository } from '../../domain/enrollment/enrollment.repository.interface';
import type { IContentRepository } from '../../domain/content/content.repository.interface';
import { QuizAttempt, QuizAttemptStatus } from '../../domain/quiz-attempt/quiz-attempt.entity';
import { UserAnswer } from '../../domain/user-answer/user-answer.entity';
import { 
  QuizAttemptNotFoundException, 
  QuizAttemptAlreadyFinishedException,
} from '../../domain/quiz-attempt/quiz-attempt.exceptions';
import { QuizNotFoundException } from '../../domain/quiz/quiz.exceptions';
import { EnrollmentNotActiveException } from '../../domain/enrollment/enrollment.exceptions';

@Injectable()
export class QuizAttemptService {
  constructor(
    @Inject('IQuizAttemptRepository') private attemptRepository: IQuizAttemptRepository,
    @Inject('IQuizRepository') private quizRepository: IQuizRepository,
    @Inject('IQuestionRepository') private questionRepository: IQuestionRepository,
    @Inject('IUserAnswerRepository') private answerRepository: IUserAnswerRepository,
    @Inject('IQuestionOptionRepository') private optionRepository: IQuestionOptionRepository,
    @Inject('IEnrollmentRepository') private enrollmentRepository: IEnrollmentRepository,
    @Inject('IContentRepository') private contentRepository: IContentRepository,
    @InjectModel('Module') private moduleModel: Model<any>, // Injeta o modelo Module diretamente
  ) {}

  async startAttempt(userId: string, quizId: string): Promise<any> {
    // Verificar se quiz existe
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new QuizNotFoundException(quizId);
    }

    // Buscar o conteúdo associado ao quiz
    const content = await this.contentRepository.findContentById(quiz.contentId);
    if (!content) {
      throw new Error('Content not found for this quiz');
    }

    // Buscar o módulo usando o model injetado
    const module = await this.moduleModel.findById(content.moduleId).exec();
    if (!module) {
      throw new Error('Module not found');
    }

    const courseId = module.course_id;
    if (!courseId) {
      throw new Error('Course ID not found in module');
    }

    // Verificar se usuário está matriculado no curso
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (!enrollment) {
      throw new Error('User is not enrolled in this course');
    }

    if (!enrollment.isActive && !enrollment.isCompleted) {
      throw new EnrollmentNotActiveException(enrollment.id);
    }

    // Verificar limite de tentativas
    const attemptsCount = await this.attemptRepository.countAttemptsByUserAndQuiz(userId, quizId);
    if (attemptsCount >= quiz.attemptsAllowed) {
      throw new BadRequestException(`Maximum attempts (${quiz.attemptsAllowed}) exceeded`);
    }

    const attempt = new QuizAttempt(quizId, userId, enrollment.id);
    const saved = await this.attemptRepository.save(attempt);
    return saved.toJSON();
  }

  async submitAttempt(attemptId: string, answers: any[]): Promise<any> {
    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) {
      throw new QuizAttemptNotFoundException(attemptId);
    }

    if (attempt.isFinished) {
      throw new QuizAttemptAlreadyFinishedException(attemptId);
    }

    const quiz = await this.quizRepository.findById(attempt.quizId);
    if (!quiz) {
      throw new QuizNotFoundException(attempt.quizId);
    }

    const questions = await this.questionRepository.findByQuiz(attempt.quizId);
    
    let totalScore = 0;
    let totalPoints = 0;

    for (const question of questions) {
      const userAnswer = answers.find(a => a.questionId === question.id);
      if (!userAnswer) continue;

      const normalizedOptionIds: string[] = Array.isArray(userAnswer.selectedOptionIds)
        ? [
            ...new Set<string>(
              userAnswer.selectedOptionIds.filter(
                (optionId: unknown): optionId is string => typeof optionId === 'string' && optionId.trim().length > 0,
              ),
            ),
          ]
        : [];

      if (normalizedOptionIds.length === 0 && typeof userAnswer.selectedOptionId === 'string' && userAnswer.selectedOptionId.trim().length > 0) {
        normalizedOptionIds.push(userAnswer.selectedOptionId);
      }

      const answer = new UserAnswer(
        attemptId,
        question.id,
        0,
        normalizedOptionIds[0],
        userAnswer.textResponse,
      );
      answer.selectedOptionIds = normalizedOptionIds.length > 0 ? normalizedOptionIds : undefined;

      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const options = await this.optionRepository.findCorrectOptions(question.id);
        const correctOptionIds = options.map(option => option.id);

        if (question.type === 'multiple_choice') {
          const correctOptionIdSet = new Set<string>(correctOptionIds);
          const isCorrect =
            normalizedOptionIds.length > 0 &&
            normalizedOptionIds.length === correctOptionIds.length &&
            normalizedOptionIds.every(optionId => correctOptionIdSet.has(optionId));

          answer.isCorrect = isCorrect;
          answer.pointsEarned = isCorrect ? question.points : 0;
        } else {
          const selectedOptionId = normalizedOptionIds[0];
          const isCorrect = Boolean(selectedOptionId && correctOptionIds.includes(selectedOptionId));
          answer.isCorrect = isCorrect;
          answer.pointsEarned = isCorrect ? question.points : 0;
          answer.selectedOptionIds = selectedOptionId ? [selectedOptionId] : undefined;
          answer.selectedOptionId = selectedOptionId;
        }
      } else if (question.type === 'essay') {
        answer.textResponse = userAnswer.textResponse;
        answer.isCorrect = undefined;
        answer.pointsEarned = 0;
      }

      await this.answerRepository.save(answer);
      totalScore += answer.pointsEarned;
      totalPoints += question.points;
    }

    const scorePercentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
    const isPassed = scorePercentage >= quiz.passingScorePercentage;

    attempt.finish(scorePercentage, isPassed);
    await this.attemptRepository.update(attemptId, attempt);

    return {
      attemptId: attempt.id,
      totalScore: scorePercentage,
      isPassed,
      totalPoints,
      earnedPoints: totalScore,
    };
  }

  async findById(id: string): Promise<any> {
    const attempt = await this.attemptRepository.findById(id);
    if (!attempt) {
      throw new QuizAttemptNotFoundException(id);
    }
    return attempt.toJSON();
  }

  async findByUser(userId: string): Promise<any[]> {
    const attempts = await this.attemptRepository.findByUser(userId);
    return attempts.map(a => a.toJSON());
  }

  async findByQuiz(quizId: string): Promise<any[]> {
    const attempts = await this.attemptRepository.findByQuiz(quizId);
    return attempts.map(a => a.toJSON());
  }

  async getAttemptResults(attemptId: string): Promise<any> {
    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) {
      throw new QuizAttemptNotFoundException(attemptId);
    }

    const answers = await this.answerRepository.findByAttempt(attemptId);
    const questions = await this.questionRepository.findByQuiz(attempt.quizId);

    const results = await Promise.all(questions.map(async (q) => {
      const answer = answers.find(a => a.questionId === q.id);
      const options = await this.optionRepository.findByQuestion(q.id);
      
      return {
        questionId: q.id,
        questionText: q.questionText,
        points: q.points,
        pointsEarned: answer ? answer.pointsEarned : 0,
        isCorrect: answer ? answer.isCorrect : null,
        selectedOptionId: answer ? answer.selectedOptionId : null,
        selectedOptionIds: answer ? answer.selectedOptionIds ?? (answer.selectedOptionId ? [answer.selectedOptionId] : []) : [],
        textResponse: answer ? answer.textResponse : null,
        options: options.map(o => ({
          id: o.id,
          text: o.optionText,
          isCorrect: o.isCorrect,
        })),
      };
    }));

    return {
      attempt: attempt.toJSON(),
      answers: results,
    };
  }

  async abandonAttempt(id: string): Promise<any> {
    const attempt = await this.attemptRepository.findById(id);
    if (!attempt) {
      throw new QuizAttemptNotFoundException(id);
    }
    attempt.abandon();
    const updated = await this.attemptRepository.update(id, attempt);
    return updated.toJSON();
  }
}
