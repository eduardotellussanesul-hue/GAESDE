import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { QuestionOption } from '../../domain/question-option/question-option.entity';
import { IQuestionOptionRepository } from '../../domain/question-option/question-option.repository.interface';

export interface QuestionOptionDocument extends Document {
  question_id: string;
  option_text: string;
  is_correct: boolean;
  created_at: Date;
}

export const QuestionOptionSchema = new Schema<QuestionOptionDocument>(
  {
    question_id: {
      type: String,
      required: true,
      ref: 'Question',
    },
    option_text: {
      type: String,
      required: true,
    },
    is_correct: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  },
);

QuestionOptionSchema.index({ question_id: 1 });

@Injectable()
export class QuestionOptionRepository implements IQuestionOptionRepository {
  constructor(@InjectModel('QuestionOption') private optionModel: Model<QuestionOptionDocument>) {}

  async save(option: QuestionOption): Promise<QuestionOption> {
    const newOption = new this.optionModel({
      question_id: option.questionId,
      option_text: option.optionText,
      is_correct: option.isCorrect,
    });
    const saved = await newOption.save();
    option.id = saved._id.toString();
    return option;
  }

  async findById(id: string): Promise<QuestionOption | null> {
    const found = await this.optionModel.findById(id).exec();
    if (!found) return null;
    const option = new QuestionOption(found.question_id, found.option_text, found.is_correct);
    option.id = found._id.toString();
    return option;
  }

  async findByQuestion(questionId: string): Promise<QuestionOption[]> {
    const found = await this.optionModel.find({ question_id: questionId }).exec();
    return found.map(f => {
      const option = new QuestionOption(f.question_id, f.option_text, f.is_correct);
      option.id = f._id.toString();
      return option;
    });
  }

  async findCorrectOptions(questionId: string): Promise<QuestionOption[]> {
    const found = await this.optionModel.find({ question_id: questionId, is_correct: true }).exec();
    return found.map(f => {
      const option = new QuestionOption(f.question_id, f.option_text, f.is_correct);
      option.id = f._id.toString();
      return option;
    });
  }

  async findAll(): Promise<QuestionOption[]> {
    const found = await this.optionModel.find().exec();
    return found.map(f => {
      const option = new QuestionOption(f.question_id, f.option_text, f.is_correct);
      option.id = f._id.toString();
      return option;
    });
  }

  async update(id: string, data: Partial<QuestionOption>): Promise<QuestionOption | null> {
    const updateData: any = {};
    if (data.optionText !== undefined) updateData.option_text = data.optionText;
    if (data.isCorrect !== undefined) updateData.is_correct = data.isCorrect;

    const updated = await this.optionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    const option = new QuestionOption(updated.question_id, updated.option_text, updated.is_correct);
    option.id = updated._id.toString();
    return option;
  }

  async delete(id: string): Promise<void> {
    await this.optionModel.findByIdAndDelete(id).exec();
  }

  async deleteByQuestion(questionId: string): Promise<void> {
    await this.optionModel.deleteMany({ question_id: questionId }).exec();
  }
}
