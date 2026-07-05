import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Content, ContentType } from '../../domain/content/content.entity';
import { ContentVideo } from '../../domain/content/content-video.entity';
import { ContentText } from '../../domain/content/content-text.entity';
import { ContentPdf } from '../../domain/content/content-pdf.entity';
import { IContentRepository } from '../../domain/content/content.repository.interface';

// ===== Content Schema =====
export interface ContentDocument extends Document {
  module_id: string;
  title: string;
  type: string;
  order_index: number;
  is_free_preview: boolean;
  duration_seconds?: number;
  created_at: Date;
  updated_at: Date;
}

export const ContentSchema = new Schema<ContentDocument>(
  {
    module_id: {
      type: String,
      required: true,
      ref: 'Module',
    },
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(ContentType),
    },
    order_index: {
      type: Number,
      required: true,
      min: 0,
    },
    is_free_preview: {
      type: Boolean,
      default: false,
    },
    duration_seconds: {
      type: Number,
      required: false,
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

ContentSchema.index({ module_id: 1, order_index: 1 });
ContentSchema.index({ module_id: 1, type: 1 });

// ===== ContentVideo Schema =====
export interface ContentVideoDocument extends Document {
  content_id: string;
  video_url: string;
  video_duration_seconds?: number;
  created_at: Date;
}

export const ContentVideoSchema = new Schema<ContentVideoDocument>(
  {
    content_id: {
      type: String,
      required: true,
      unique: true,
      ref: 'Content',
    },
    video_url: {
      type: String,
      required: true,
    },
    video_duration_seconds: {
      type: Number,
      required: false,
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

ContentVideoSchema.index({ content_id: 1 }, { unique: true });

// ===== ContentText Schema =====
export interface ContentTextDocument extends Document {
  content_id: string;
  body: string;
  created_at: Date;
}

export const ContentTextSchema = new Schema<ContentTextDocument>(
  {
    content_id: {
      type: String,
      required: true,
      unique: true,
      ref: 'Content',
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  },
);

ContentTextSchema.index({ content_id: 1 }, { unique: true });

// ===== ContentPdf Schema =====
export interface ContentPdfDocument extends Document {
  content_id: string;
  file_url: string;
  file_size_bytes?: number;
  created_at: Date;
}

export const ContentPdfSchema = new Schema<ContentPdfDocument>(
  {
    content_id: {
      type: String,
      required: true,
      unique: true,
      ref: 'Content',
    },
    file_url: {
      type: String,
      required: true,
    },
    file_size_bytes: {
      type: Number,
      required: false,
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

ContentPdfSchema.index({ content_id: 1 }, { unique: true });

// ===== Repository Implementation =====
@Injectable()
export class ContentRepository implements IContentRepository {
  constructor(
    @InjectModel('Content') private contentModel: Model<ContentDocument>,
    @InjectModel('ContentVideo') private videoModel: Model<ContentVideoDocument>,
    @InjectModel('ContentText') private textModel: Model<ContentTextDocument>,
    @InjectModel('ContentPdf') private pdfModel: Model<ContentPdfDocument>,
  ) {}

  // ===== CONTENT =====
  async saveContent(content: Content): Promise<Content> {
    const newContent = new this.contentModel({
      module_id: content.moduleId,
      title: content.title,
      type: content.type,
      order_index: content.orderIndex,
      is_free_preview: content.isFreePreview,
      duration_seconds: content.durationSeconds,
    });
    const saved = await newContent.save();
    content.id = saved._id.toString();
    return content;
  }

  async findContentById(id: string): Promise<Content | null> {
    const found = await this.contentModel.findById(id).exec();
    if (!found) return null;
    const content = new Content(
      found.module_id,
      found.title,
      found.type as ContentType,
      found.order_index,
      found.is_free_preview,
      found.duration_seconds || undefined,
    );
    content.id = found._id.toString();
    return content;
  }

  async findContentsByModule(moduleId: string): Promise<Content[]> {
    const found = await this.contentModel
      .find({ module_id: moduleId })
      .sort({ order_index: 1 })
      .exec();
    return found.map((f) => {
      const content = new Content(
        f.module_id,
        f.title,
        f.type as ContentType,
        f.order_index,
        f.is_free_preview,
        f.duration_seconds || undefined,
      );
      content.id = f._id.toString();
      return content;
    });
  }

  async findContentsByType(type: ContentType): Promise<Content[]> {
    const found = await this.contentModel.find({ type }).exec();
    return found.map((f) => {
      const content = new Content(
        f.module_id,
        f.title,
        f.type as ContentType,
        f.order_index,
        f.is_free_preview,
        f.duration_seconds || undefined,
      );
      content.id = f._id.toString();
      return content;
    });
  }

  async findAllContents(): Promise<Content[]> {
    const found = await this.contentModel.find().exec();
    return found.map((f) => {
      const content = new Content(
        f.module_id,
        f.title,
        f.type as ContentType,
        f.order_index,
        f.is_free_preview,
        f.duration_seconds || undefined,
      );
      content.id = f._id.toString();
      return content;
    });
  }

  async updateContent(id: string, data: Partial<Content>): Promise<Content | null> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;
    if (data.isFreePreview !== undefined) updateData.is_free_preview = data.isFreePreview;
    if (data.durationSeconds !== undefined) updateData.duration_seconds = data.durationSeconds;

    const updated = await this.contentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    const content = new Content(
      updated.module_id,
      updated.title,
      updated.type as ContentType,
      updated.order_index,
      updated.is_free_preview,
      updated.duration_seconds || undefined,
    );
    content.id = updated._id.toString();
    return content;
  }

  async deleteContent(id: string): Promise<void> {
    // Deletar conteúdo específico associado
    await this.videoModel.deleteMany({ content_id: id });
    await this.textModel.deleteMany({ content_id: id });
    await this.pdfModel.deleteMany({ content_id: id });
    await this.contentModel.findByIdAndDelete(id).exec();
  }

  async reorderContents(moduleId: string, contentIds: string[]): Promise<void> {
    const updates = contentIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, module_id: moduleId },
        update: { $set: { order_index: index } },
      },
    }));
    await this.contentModel.bulkWrite(updates);
  }

  // ===== CONTENT VIDEO =====
  async saveVideo(video: ContentVideo): Promise<ContentVideo> {
    const newVideo = new this.videoModel({
      content_id: video.contentId,
      video_url: video.videoUrl,
      video_duration_seconds: video.videoDurationSeconds,
    });
    const saved = await newVideo.save();
    video.id = saved._id.toString();
    return video;
  }

  async findVideoByContent(contentId: string): Promise<ContentVideo | null> {
    const found = await this.videoModel.findOne({ content_id: contentId }).exec();
    if (!found) return null;
    const video = new ContentVideo(
      found.content_id,
      found.video_url,
      found.video_duration_seconds || undefined,
    );
    video.id = found._id.toString();
    return video;
  }

  async deleteVideo(contentId: string): Promise<void> {
    await this.videoModel.deleteMany({ content_id: contentId }).exec();
  }

  // ===== CONTENT TEXT =====
  async saveText(text: ContentText): Promise<ContentText> {
    const newText = new this.textModel({
      content_id: text.contentId,
      body: text.body,
    });
    const saved = await newText.save();
    text.id = saved._id.toString();
    return text;
  }

  async findTextByContent(contentId: string): Promise<ContentText | null> {
    const found = await this.textModel.findOne({ content_id: contentId }).exec();
    if (!found) return null;
    const text = new ContentText(found.content_id, found.body);
    text.id = found._id.toString();
    return text;
  }

  async deleteText(contentId: string): Promise<void> {
    await this.textModel.deleteMany({ content_id: contentId }).exec();
  }

  // ===== CONTENT PDF =====
  async savePdf(pdf: ContentPdf): Promise<ContentPdf> {
    const newPdf = new this.pdfModel({
      content_id: pdf.contentId,
      file_url: pdf.fileUrl,
      file_size_bytes: pdf.fileSizeBytes,
    });
    const saved = await newPdf.save();
    pdf.id = saved._id.toString();
    return pdf;
  }

  async findPdfByContent(contentId: string): Promise<ContentPdf | null> {
    const found = await this.pdfModel.findOne({ content_id: contentId }).exec();
    if (!found) return null;
    const pdf = new ContentPdf(
      found.content_id,
      found.file_url,
      found.file_size_bytes || undefined,
    );
    pdf.id = found._id.toString();
    return pdf;
  }

  async deletePdf(contentId: string): Promise<void> {
    await this.pdfModel.deleteMany({ content_id: contentId }).exec();
  }
}
