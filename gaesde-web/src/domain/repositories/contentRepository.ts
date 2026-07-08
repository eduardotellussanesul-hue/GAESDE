import type { ContentItem, ContentType } from '../entities/content';

export interface ContentRepository {
  listContentsByModule(token: string, moduleId: string): Promise<ContentItem[]>;
  getFullContent(token: string, contentId: string): Promise<ContentItem>;
  createContent(token: string, data: { moduleId: string; title: string; type: ContentType; orderIndex: number; isFreePreview?: boolean; durationSeconds?: number }): Promise<ContentItem>;
  updateContent(token: string, contentId: string, data: Partial<Pick<ContentItem, 'title' | 'orderIndex' | 'isFreePreview' | 'durationSeconds'>>): Promise<ContentItem>;
  deleteContent(token: string, contentId: string): Promise<void>;
  reorderContents(token: string, moduleId: string, contentIds: string[]): Promise<void>;
  createOrUpdateContentDetails(token: string, contentId: string, type: ContentType, data: Record<string, unknown>, update?: boolean): Promise<void>;
}