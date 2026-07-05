import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { ContentCompletion } from '../../domain/content-completion/content-completion.entity';
import { IContentCompletionRepository } from '../../domain/content-completion/content-completion.repository.interface';

export interface ContentCompletionDocument extends Document {
  user_id: string;
  content_id: string;
  completed_at: Date;
}

export const ContentCompletionSchema = new Schema<ContentCompletionDocument>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    content_id: {
      type: String,
      required: true,
      ref: 'Content',
    },
  },
  {
    timestamps: {
      createdAt: 'completed_at',
      updatedAt: false,
    },
  },
);

ContentCompletionSchema.index({ user_id: 1, content_id: 1 }, { unique: true });
ContentCompletionSchema.index({ user_id: 1 });
ContentCompletionSchema.index({ content_id: 1 });

@Injectable()
export class ContentCompletionRepository implements IContentCompletionRepository {
  constructor(
    @InjectModel('ContentCompletion') private completionModel: Model<ContentCompletionDocument>,
  ) {}

  async save(completion: ContentCompletion): Promise<ContentCompletion> {
    const newCompletion = new this.completionModel({
      user_id: completion.userId,
      content_id: completion.contentId,
    });
    const saved = await newCompletion.save();
    completion.id = saved._id.toString();
    return completion;
  }

  async findById(id: string): Promise<ContentCompletion | null> {
    const found = await this.completionModel.findById(id).exec();
    if (!found) return null;
    const completion = new ContentCompletion(found.user_id, found.content_id);
    completion.id = found._id.toString();
    return completion;
  }

  async findByUser(userId: string): Promise<ContentCompletion[]> {
    const found = await this.completionModel.find({ user_id: userId }).exec();
    return found.map(f => {
      const completion = new ContentCompletion(f.user_id, f.content_id);
      completion.id = f._id.toString();
      return completion;
    });
  }

  async findByContent(contentId: string): Promise<ContentCompletion[]> {
    const found = await this.completionModel.find({ content_id: contentId }).exec();
    return found.map(f => {
      const completion = new ContentCompletion(f.user_id, f.content_id);
      completion.id = f._id.toString();
      return completion;
    });
  }

  async findByUserAndContent(userId: string, contentId: string): Promise<ContentCompletion | null> {
    const found = await this.completionModel.findOne({ user_id: userId, content_id: contentId }).exec();
    if (!found) return null;
    const completion = new ContentCompletion(found.user_id, found.content_id);
    completion.id = found._id.toString();
    return completion;
  }

  async findByUserAndModule(userId: string, moduleId: string): Promise<ContentCompletion[]> {
    // Usar o modelo Content através do db
    const contentModel = this.completionModel.db.model('Content');
    const contents = await contentModel.find({ module_id: moduleId }).exec();
    const contentIds = contents.map((c: any) => c._id.toString());
    
    const found = await this.completionModel.find({ 
      user_id: userId,
      content_id: { $in: contentIds },
    }).exec();
    
    return found.map(f => {
      const completion = new ContentCompletion(f.user_id, f.content_id);
      completion.id = f._id.toString();
      return completion;
    });
  }

  async findAll(): Promise<ContentCompletion[]> {
    const found = await this.completionModel.find().exec();
    return found.map(f => {
      const completion = new ContentCompletion(f.user_id, f.content_id);
      completion.id = f._id.toString();
      return completion;
    });
  }

  async delete(id: string): Promise<void> {
    await this.completionModel.findByIdAndDelete(id).exec();
  }

  async deleteByUserAndContent(userId: string, contentId: string): Promise<void> {
    await this.completionModel.deleteOne({ user_id: userId, content_id: contentId }).exec();
  }
}
