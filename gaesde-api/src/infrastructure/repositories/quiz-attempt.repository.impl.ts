import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { QuizAttempt, QuizAttemptStatus } from '../../domain/quiz-attempt/quiz-attempt.entity';
import { IQuizAttemptRepository } from '../../domain/quiz-attempt/quiz-attempt.repository.interface';

export interface QuizAttemptDocument extends Document {
  quiz_id: string;
  user_id: string;
  enrollment_id: string;
  status: string;
  started_at: Date;
  submitted_at?: Date;
  total_score?: number;
  is_passed?: boolean;
  created_at: Date;
}

export const QuizAttemptSchema = new Schema<QuizAttemptDocument>(
  {
    quiz_id: {
      type: String,
      required: true,
      ref: 'Quiz',
    },
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    enrollment_id: {
      type: String,
      required: true,
      ref: 'Enrollment',
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(QuizAttemptStatus),
      default: QuizAttemptStatus.IN_PROGRESS,
    },
    submitted_at: {
      type: Date,
      required: false,
    },
    total_score: {
      type: Number,
      required: false,
      min: 0,
    },
    is_passed: {
      type: Boolean,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: 'started_at',
      updatedAt: false,
    },
  },
);

QuizAttemptSchema.index({ quiz_id: 1, user_id: 1 });
QuizAttemptSchema.index({ enrollment_id: 1 });
QuizAttemptSchema.index({ status: 1 });

@Injectable()
export class QuizAttemptRepository implements IQuizAttemptRepository {
  constructor(@InjectModel('QuizAttempt') private attemptModel: Model<QuizAttemptDocument>) {}

  private mapToEntity(doc: QuizAttemptDocument): QuizAttempt {
    const attempt = new QuizAttempt(
      doc.quiz_id,
      doc.user_id,
      doc.enrollment_id,
      doc.status as QuizAttemptStatus,
    );
    attempt.id = doc._id.toString();

    // Restore persisted lifecycle/result fields so API responses show real score/pass state.
    const hydratedAttempt = attempt as unknown as {
      _startedAt: Date;
      _createdAt: Date;
      _submittedAt?: Date;
      _totalScore?: number;
      _isPassed?: boolean;
    };

    hydratedAttempt._startedAt = doc.started_at;
    hydratedAttempt._createdAt = doc.started_at;
    hydratedAttempt._submittedAt = doc.submitted_at || undefined;
    hydratedAttempt._totalScore = doc.total_score ?? undefined;
    hydratedAttempt._isPassed = doc.is_passed ?? undefined;

    return attempt;
  }

  async save(attempt: QuizAttempt): Promise<QuizAttempt> {
    const newAttempt = new this.attemptModel({
      quiz_id: attempt.quizId,
      user_id: attempt.userId,
      enrollment_id: attempt.enrollmentId,
      status: attempt.status,
      submitted_at: attempt.submittedAt,
      total_score: attempt.totalScore,
      is_passed: attempt.isPassed,
    });
    const saved = await newAttempt.save();
    attempt.id = saved._id.toString();
    return attempt;
  }

  async findById(id: string): Promise<QuizAttempt | null> {
    const found = await this.attemptModel.findById(id).exec();
    if (!found) return null;
    return this.mapToEntity(found);
  }

  async findByUser(userId: string): Promise<QuizAttempt[]> {
    const found = await this.attemptModel.find({ user_id: userId }).exec();
    return found.map(f => this.mapToEntity(f));
  }

  async findByQuiz(quizId: string): Promise<QuizAttempt[]> {
    const found = await this.attemptModel.find({ quiz_id: quizId }).exec();
    return found.map(f => this.mapToEntity(f));
  }

  async findByEnrollment(enrollmentId: string): Promise<QuizAttempt[]> {
    const found = await this.attemptModel.find({ enrollment_id: enrollmentId }).exec();
    return found.map(f => this.mapToEntity(f));
  }

  async findByUserAndQuiz(userId: string, quizId: string): Promise<QuizAttempt[]> {
    const found = await this.attemptModel
      .find({ user_id: userId, quiz_id: quizId })
      .exec();
    return found.map(f => this.mapToEntity(f));
  }

  async findByStatus(status: QuizAttemptStatus): Promise<QuizAttempt[]> {
    const found = await this.attemptModel.find({ status }).exec();
    return found.map(f => this.mapToEntity(f));
  }

  async findAll(): Promise<QuizAttempt[]> {
    const found = await this.attemptModel.find().exec();
    return found.map(f => this.mapToEntity(f));
  }

  async update(id: string, data: Partial<QuizAttempt>): Promise<QuizAttempt | null> {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.submittedAt !== undefined) updateData.submitted_at = data.submittedAt;
    if (data.totalScore !== undefined) updateData.total_score = data.totalScore;
    if (data.isPassed !== undefined) updateData.is_passed = data.isPassed;

    const updated = await this.attemptModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.attemptModel.findByIdAndDelete(id).exec();
  }

  async countAttemptsByUserAndQuiz(userId: string, quizId: string): Promise<number> {
    return this.attemptModel.countDocuments({
      user_id: userId,
      quiz_id: quizId,
      status: QuizAttemptStatus.FINISHED,
    }).exec();
  }
}
