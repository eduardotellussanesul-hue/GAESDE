import { Injectable, Inject } from '@nestjs/common';
import type { IContentRepository } from '../../domain/content/content.repository.interface';
import { Content, ContentType } from '../../domain/content/content.entity';
import { ContentVideo } from '../../domain/content/content-video.entity';
import { ContentText } from '../../domain/content/content-text.entity';
import { ContentPdf } from '../../domain/content/content-pdf.entity';
import { 
  ContentNotFoundException, 
  ContentTypeNotSupportedException,
  ContentVideoNotFoundException,
  ContentTextNotFoundException,
  ContentPdfNotFoundException,
} from '../../domain/content/content.exceptions';

@Injectable()
export class ContentService {
  constructor(
    @Inject('IContentRepository') private contentRepository: IContentRepository,
  ) {}

  // ===== CONTENT =====
  async createContent(data: {
    moduleId: string;
    title: string;
    type: ContentType;
    orderIndex: number;
    isFreePreview?: boolean;
    durationSeconds?: number;
  }): Promise<any> {
    const content = new Content(
      data.moduleId,
      data.title,
      data.type,
      data.orderIndex,
      data.isFreePreview || false,
      data.durationSeconds,
    );
    const saved = await this.contentRepository.saveContent(content);
    return this.mapToResponse(saved);
  }

  async findAllContents(): Promise<any[]> {
    const contents = await this.contentRepository.findAllContents();
    return contents.map(content => this.mapToResponse(content));
  }

  async findContentById(id: string): Promise<any> {
    const content = await this.contentRepository.findContentById(id);
    if (!content) {
      throw new ContentNotFoundException(id);
    }
    return this.mapToResponse(content);
  }

  async findContentsByModule(moduleId: string): Promise<any[]> {
    const contents = await this.contentRepository.findContentsByModule(moduleId);
    return contents.map(content => this.mapToResponse(content));
  }

  async updateContent(id: string, data: {
    title?: string;
    orderIndex?: number;
    isFreePreview?: boolean;
    durationSeconds?: number;
  }): Promise<any> {
    const content = await this.contentRepository.findContentById(id);
    if (!content) {
      throw new ContentNotFoundException(id);
    }

    if (data.title) content.title = data.title;
    if (data.orderIndex !== undefined) content.orderIndex = data.orderIndex;
    if (data.isFreePreview !== undefined) content.isFreePreview = data.isFreePreview;
    if (data.durationSeconds !== undefined) content.durationSeconds = data.durationSeconds;

    const updated = await this.contentRepository.updateContent(id, content);
    if (!updated) {
      throw new ContentNotFoundException(id);
    }
    return this.mapToResponse(updated);
  }

  async deleteContent(id: string): Promise<void> {
    const content = await this.contentRepository.findContentById(id);
    if (!content) {
      throw new ContentNotFoundException(id);
    }
    await this.contentRepository.deleteContent(id);
  }

  async reorderContents(moduleId: string, contentIds: string[]): Promise<void> {
    await this.contentRepository.reorderContents(moduleId, contentIds);
  }

  // ===== CONTENT VIDEO =====
  async createVideo(contentId: string, data: { videoUrl: string; videoDurationSeconds?: number }): Promise<any> {
    const content = await this.contentRepository.findContentById(contentId);
    if (!content) {
      throw new ContentNotFoundException(contentId);
    }
    if (content.type !== ContentType.VIDEO) {
      throw new ContentTypeNotSupportedException('This content is not a video');
    }

    const video = new ContentVideo(contentId, data.videoUrl, data.videoDurationSeconds);
    const saved = await this.contentRepository.saveVideo(video);
    return saved.toJSON();
  }

  async findVideoByContent(contentId: string): Promise<any> {
    const video = await this.contentRepository.findVideoByContent(contentId);
    if (!video) {
      throw new ContentVideoNotFoundException(contentId);
    }
    return video.toJSON();
  }

  async updateVideo(contentId: string, data: { videoUrl?: string; videoDurationSeconds?: number }): Promise<any> {
    const video = await this.contentRepository.findVideoByContent(contentId);
    if (!video) {
      throw new ContentVideoNotFoundException(contentId);
    }

    if (data.videoUrl) video.videoUrl = data.videoUrl;
    if (data.videoDurationSeconds !== undefined) video.videoDurationSeconds = data.videoDurationSeconds;

    await this.contentRepository.saveVideo(video);
    return video.toJSON();
  }

  // ===== CONTENT TEXT =====
  async createText(contentId: string, data: { body: string }): Promise<any> {
    const content = await this.contentRepository.findContentById(contentId);
    if (!content) {
      throw new ContentNotFoundException(contentId);
    }
    if (content.type !== ContentType.TEXT) {
      throw new ContentTypeNotSupportedException('This content is not a text');
    }

    const text = new ContentText(contentId, data.body);
    const saved = await this.contentRepository.saveText(text);
    return saved.toJSON();
  }

  async findTextByContent(contentId: string): Promise<any> {
    const text = await this.contentRepository.findTextByContent(contentId);
    if (!text) {
      throw new ContentTextNotFoundException(contentId);
    }
    return text.toJSON();
  }

  async updateText(contentId: string, data: { body: string }): Promise<any> {
    const text = await this.contentRepository.findTextByContent(contentId);
    if (!text) {
      throw new ContentTextNotFoundException(contentId);
    }

    text.body = data.body;
    await this.contentRepository.saveText(text);
    return text.toJSON();
  }

  // ===== CONTENT PDF =====
  async createPdf(contentId: string, data: { fileUrl: string; fileSizeBytes?: number }): Promise<any> {
    const content = await this.contentRepository.findContentById(contentId);
    if (!content) {
      throw new ContentNotFoundException(contentId);
    }
    if (content.type !== ContentType.PDF) {
      throw new ContentTypeNotSupportedException('This content is not a PDF');
    }

    const pdf = new ContentPdf(contentId, data.fileUrl, data.fileSizeBytes);
    const saved = await this.contentRepository.savePdf(pdf);
    return saved.toJSON();
  }

  async findPdfByContent(contentId: string): Promise<any> {
    const pdf = await this.contentRepository.findPdfByContent(contentId);
    if (!pdf) {
      throw new ContentPdfNotFoundException(contentId);
    }
    return pdf.toJSON();
  }

  async updatePdf(contentId: string, data: { fileUrl?: string; fileSizeBytes?: number }): Promise<any> {
    const pdf = await this.contentRepository.findPdfByContent(contentId);
    if (!pdf) {
      throw new ContentPdfNotFoundException(contentId);
    }

    if (data.fileUrl) pdf.fileUrl = data.fileUrl;
    if (data.fileSizeBytes !== undefined) pdf.fileSizeBytes = data.fileSizeBytes;

    await this.contentRepository.savePdf(pdf);
    return pdf.toJSON();
  }

  // ===== HELPERS =====
  async getFullContent(contentId: string): Promise<any> {
    const content = await this.contentRepository.findContentById(contentId);
    if (!content) {
      throw new ContentNotFoundException(contentId);
    }

    const result: any = this.mapToResponse(content);

    switch (content.type) {
      case ContentType.VIDEO:
        result.video = await this.findVideoByContent(contentId).catch(() => null);
        break;
      case ContentType.TEXT:
        result.text = await this.findTextByContent(contentId).catch(() => null);
        break;
      case ContentType.PDF:
        result.pdf = await this.findPdfByContent(contentId).catch(() => null);
        break;
    }

    return result;
  }

  private mapToResponse(content: Content): any {
    return content.toJSON();
  }
}
