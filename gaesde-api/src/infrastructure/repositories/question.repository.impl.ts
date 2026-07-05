import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Question, QuestionType } from '../../domain/question/question.entity';
import { IQuestionRepository } from '../../domain/question/question.repository.interface';

export interface QuestionDocument extends Document {
  quiz_id: string;
  type: string;
  question_text: string;
  points: number;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export const QuestionSchema = new Schema<QuestionDocument>(
  {
    quiz_id: {
      type: String,
      required: true,
      ref: 'Quiz',
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(QuestionType),
    },
    question_text: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    order_index: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

QuestionSchema.index({ quiz_id: 1, order_index: 1 });
QuestionSchema.index({ quiz_id: 1, type: 1 });

@Injectable()
export class QuestionRepository implements IQuestionRepository {
  constructor(@InjectModel('Question') private questionModel: Model<QuestionDocument>) {}

  async save(question: Question): Promise<Question> {
    const newQuestion = new this.questionModel({
      quiz_id: question.quizId,
      type: question.type,
      question_text: question.questionText,
      points: question.points,
      order_index: question.orderIndex,
    });
    const saved = await newQuestion.save();
    question.id = saved._id.toString();
    return question;
  }

  async findById(id: string): Promise<Question | null> {
    const found = await this.questionModel.findById(id).exec();
    if (!found) return null;
    const question = new Question(
      found.quiz_id,
      found.type as QuestionType,
      found.question_text,
      found.points,
      found.order_index,
    );
    question.id = found._id.toString();
    return question;
  }

  async findByQuiz(quizId: string): Promise<Question[]> {
    const found = await this.questionModel
      .find({ quiz_id: quizId })
      .sort({ order_index: 1 })
      .exec();
    return found.map(f => {
      const question = new Question(
        f.quiz_id,
        f.type as QuestionType,
        f.question_text,
        f.points,
        f.order_index,
      );
      question.id = f._id.toString();
      return question;
    });
  }

  async findByType(type: QuestionType): Promise<Question[]> {
    const found = await this.questionModel.find({ type }).exec();
    return found.map(f => {
      const question = new Question(
        f.quiz_id,
        f.type as QuestionType,
        f.question_text,
        f.points,
        f.order_index,
      );
      question.id = f._id.toString();
      return question;
    });
  }

  async findAll(): Promise<Question[]> {
    const found = await this.questionModel.find().exec();
    return found.map(f => {
      const question = new Question(
        f.quiz_id,
        f.type as QuestionType,
        f.question_text,
        f.points,
        f.order_index,
      );
      question.id = f._id.toString();
      return question;
    });
  }

  async update(id: string, data: Partial<Question>): Promise<Question | null> {
    const updateData: any = {};
    if (data.questionText !== undefined) updateData.question_text = data.questionText;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;

    const updated = await this.questionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    const question = new Question(
      updated.quiz_id,
      updated.type as QuestionType,
      updated.question_text,
      updated.points,
      updated.order_index,
    );
    question.id = updated._id.toString();
    return question;
  }

  async delete(id: string): Promise<void> {
    await this.questionModel.findByIdAndDelete(id).exec();
  }

  async deleteByQuiz(quizId: string): Promise<void> {
    await this.questionModel.deleteMany({ quiz_id: quizId }).exec();
  }

  async reorderQuestions(quizId: string, questionIds: string[]): Promise<void> {
    const updates = questionIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, quiz_id: quizId },
        update: { $set: { order_index: index } },
      },
    }));
    await this.questionModel.bulkWrite(updates);
  }
}
