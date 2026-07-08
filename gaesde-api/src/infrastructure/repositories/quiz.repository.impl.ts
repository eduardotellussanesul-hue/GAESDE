import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Quiz } from '../../domain/quiz/quiz.entity';
import { IQuizRepository } from '../../domain/quiz/quiz.repository.interface';

export interface QuizDocument extends Document {
  content_id: string;
  time_limit_minutes?: number;
  passing_score_percentage: number;
  attempts_allowed: number;
  shuffle_questions: boolean;
  created_at: Date;
  updated_at: Date;
}

export const QuizSchema = new Schema<QuizDocument>(
  {
    content_id: {
      type: String,
      required: true,
      unique: true,
      ref: 'Content',
    },
    time_limit_minutes: {
      type: Number,
      required: false,
      min: 0,
    },
    passing_score_percentage: {
      type: Number,
      required: true,
      default: 60,
      min: 0,
      max: 100,
    },
    attempts_allowed: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    shuffle_questions: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

// unique index for content_id already declared in schema field

@Injectable()
export class QuizRepository implements IQuizRepository {
  constructor(@InjectModel('Quiz') private quizModel: Model<QuizDocument>) {}

  async save(quiz: Quiz): Promise<Quiz> {
    const newQuiz = new this.quizModel({
      content_id: quiz.contentId,
      time_limit_minutes: quiz.timeLimitMinutes,
      passing_score_percentage: quiz.passingScorePercentage,
      attempts_allowed: quiz.attemptsAllowed,
      shuffle_questions: quiz.shuffleQuestions,
    });
    const saved = await newQuiz.save();
    quiz.id = saved._id.toString();
    return quiz;
  }

  async findById(id: string): Promise<Quiz | null> {
    const found = await this.quizModel.findById(id).exec();
    if (!found) return null;
    const quiz = new Quiz(
      found.content_id,
      found.passing_score_percentage,
      found.attempts_allowed,
      found.shuffle_questions,
      found.time_limit_minutes || undefined,
    );
    quiz.id = found._id.toString();
    return quiz;
  }

  async findByContent(contentId: string): Promise<Quiz | null> {
    const found = await this.quizModel.findOne({ content_id: contentId }).exec();
    if (!found) return null;
    const quiz = new Quiz(
      found.content_id,
      found.passing_score_percentage,
      found.attempts_allowed,
      found.shuffle_questions,
      found.time_limit_minutes || undefined,
    );
    quiz.id = found._id.toString();
    return quiz;
  }

  async findAll(): Promise<Quiz[]> {
    const found = await this.quizModel.find().exec();
    return found.map(f => {
      const quiz = new Quiz(
        f.content_id,
        f.passing_score_percentage,
        f.attempts_allowed,
        f.shuffle_questions,
        f.time_limit_minutes || undefined,
      );
      quiz.id = f._id.toString();
      return quiz;
    });
  }

  async update(id: string, data: Partial<Quiz>): Promise<Quiz | null> {
    const updateData: any = {};
    if (data.timeLimitMinutes !== undefined) updateData.time_limit_minutes = data.timeLimitMinutes;
    if (data.passingScorePercentage !== undefined) updateData.passing_score_percentage = data.passingScorePercentage;
    if (data.attemptsAllowed !== undefined) updateData.attempts_allowed = data.attemptsAllowed;
    if (data.shuffleQuestions !== undefined) updateData.shuffle_questions = data.shuffleQuestions;

    const updated = await this.quizModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    const quiz = new Quiz(
      updated.content_id,
      updated.passing_score_percentage,
      updated.attempts_allowed,
      updated.shuffle_questions,
      updated.time_limit_minutes || undefined,
    );
    quiz.id = updated._id.toString();
    return quiz;
  }

  async delete(id: string): Promise<void> {
    await this.quizModel.findByIdAndDelete(id).exec();
  }
}
