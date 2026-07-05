import { Content, ContentType } from './content.entity';
import { ContentVideo } from './content-video.entity';
import { ContentText } from './content-text.entity';
import { ContentPdf } from './content-pdf.entity';

export interface IContentRepository {
  // Content
  saveContent(content: Content): Promise<Content>;
  findContentById(id: string): Promise<Content | null>;
  findContentsByModule(moduleId: string): Promise<Content[]>;
  findContentsByType(type: ContentType): Promise<Content[]>;
  findAllContents(): Promise<Content[]>; // Adicionado
  updateContent(id: string, data: Partial<Content>): Promise<Content | null>;
  deleteContent(id: string): Promise<void>;
  reorderContents(moduleId: string, contentIds: string[]): Promise<void>;

  // ContentVideo
  saveVideo(video: ContentVideo): Promise<ContentVideo>;
  findVideoByContent(contentId: string): Promise<ContentVideo | null>;
  deleteVideo(contentId: string): Promise<void>;

  // ContentText
  saveText(text: ContentText): Promise<ContentText>;
  findTextByContent(contentId: string): Promise<ContentText | null>;
  deleteText(contentId: string): Promise<void>;

  // ContentPdf
  savePdf(pdf: ContentPdf): Promise<ContentPdf>;
  findPdfByContent(contentId: string): Promise<ContentPdf | null>;
  deletePdf(contentId: string): Promise<void>;
}
