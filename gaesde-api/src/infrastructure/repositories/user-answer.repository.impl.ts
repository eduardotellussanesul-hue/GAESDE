import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { UserAnswer } from '../../domain/user-answer/user-answer.entity';
import { IUserAnswerRepository } from '../../domain/user-answer/user-answer.repository.interface';

export interface UserAnswerDocument extends Document {
  attempt_id: string;
  question_id: string;
  selected_option_id?: string;
  selected_option_ids?: string[];
  text_response?: string;
  is_correct?: boolean;
  points_earned: number;
  created_at: Date;
}

export const UserAnswerSchema = new Schema<UserAnswerDocument>(
  {
    attempt_id: {
      type: String,
      required: true,
      ref: 'QuizAttempt',
    },
    question_id: {
      type: String,
      required: true,
      ref: 'Question',
    },
    selected_option_id: {
      type: String,
      required: false,
      ref: 'QuestionOption',
    },
    selected_option_ids: {
      type: [String],
      required: false,
      default: undefined,
      ref: 'QuestionOption',
    },
    text_response: {
      type: String,
      required: false,
    },
    is_correct: {
      type: Boolean,
      required: false,
    },
    points_earned: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  },
);

UserAnswerSchema.index({ attempt_id: 1, question_id: 1 }, { unique: true });
UserAnswerSchema.index({ attempt_id: 1 });

@Injectable()
export class UserAnswerRepository implements IUserAnswerRepository {
  constructor(@InjectModel('UserAnswer') private answerModel: Model<UserAnswerDocument>) {}

  async save(answer: UserAnswer): Promise<UserAnswer> {
    const newAnswer = new this.answerModel({
      attempt_id: answer.attemptId,
      question_id: answer.questionId,
      selected_option_id: answer.selectedOptionId,
      selected_option_ids: answer.selectedOptionIds,
      text_response: answer.textResponse,
      is_correct: answer.isCorrect,
      points_earned: answer.pointsEarned,
    });
    const saved = await newAnswer.save();
    answer.id = saved._id.toString();
    return answer;
  }

  async findById(id: string): Promise<UserAnswer | null> {
    const found = await this.answerModel.findById(id).exec();
    if (!found) return null;
    const answer = new UserAnswer(
      found.attempt_id,
      found.question_id,
      found.points_earned,
      found.selected_option_id || undefined,
      found.text_response || undefined,
      found.is_correct || undefined,
      found.selected_option_ids || undefined,
    );
    answer.id = found._id.toString();
    return answer;
  }

  async findByAttempt(attemptId: string): Promise<UserAnswer[]> {
    const found = await this.answerModel.find({ attempt_id: attemptId }).exec();
    return found.map(f => {
      const answer = new UserAnswer(
        f.attempt_id,
        f.question_id,
        f.points_earned,
        f.selected_option_id || undefined,
        f.text_response || undefined,
        f.is_correct || undefined,
        f.selected_option_ids || undefined,
      );
      answer.id = f._id.toString();
      return answer;
    });
  }

  async findByQuestion(questionId: string): Promise<UserAnswer[]> {
    const found = await this.answerModel.find({ question_id: questionId }).exec();
    return found.map(f => {
      const answer = new UserAnswer(
        f.attempt_id,
        f.question_id,
        f.points_earned,
        f.selected_option_id || undefined,
        f.text_response || undefined,
        f.is_correct || undefined,
        f.selected_option_ids || undefined,
      );
      answer.id = f._id.toString();
      return answer;
    });
  }

  async findByAttemptAndQuestion(attemptId: string, questionId: string): Promise<UserAnswer | null> {
    const found = await this.answerModel.findOne({
      attempt_id: attemptId,
      question_id: questionId,
    }).exec();
    if (!found) return null;
    const answer = new UserAnswer(
      found.attempt_id,
      found.question_id,
      found.points_earned,
      found.selected_option_id || undefined,
      found.text_response || undefined,
      found.is_correct || undefined,
      found.selected_option_ids || undefined,
    );
    answer.id = found._id.toString();
    return answer;
  }

  async findAll(): Promise<UserAnswer[]> {
    const found = await this.answerModel.find().exec();
    return found.map(f => {
      const answer = new UserAnswer(
        f.attempt_id,
        f.question_id,
        f.points_earned,
        f.selected_option_id || undefined,
        f.text_response || undefined,
        f.is_correct || undefined,
        f.selected_option_ids || undefined,
      );
      answer.id = f._id.toString();
      return answer;
    });
  }

  async update(id: string, data: Partial<UserAnswer>): Promise<UserAnswer | null> {
    const updateData: any = {};
    if (data.selectedOptionId !== undefined) updateData.selected_option_id = data.selectedOptionId;
    if (data.selectedOptionIds !== undefined) updateData.selected_option_ids = data.selectedOptionIds;
    if (data.textResponse !== undefined) updateData.text_response = data.textResponse;
    if (data.isCorrect !== undefined) updateData.is_correct = data.isCorrect;
    if (data.pointsEarned !== undefined) updateData.points_earned = data.pointsEarned;

    const updated = await this.answerModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    const answer = new UserAnswer(
      updated.attempt_id,
      updated.question_id,
      updated.points_earned,
      updated.selected_option_id || undefined,
      updated.text_response || undefined,
      updated.is_correct || undefined,
      updated.selected_option_ids || undefined,
    );
    answer.id = updated._id.toString();
    return answer;
  }

  async delete(id: string): Promise<void> {
    await this.answerModel.findByIdAndDelete(id).exec();
  }

  async deleteByAttempt(attemptId: string): Promise<void> {
    await this.answerModel.deleteMany({ attempt_id: attemptId }).exec();
  }
}
