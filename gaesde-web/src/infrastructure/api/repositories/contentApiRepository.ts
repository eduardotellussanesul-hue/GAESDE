import type { ContentItem, ContentType } from '../../../domain/entities/content';
import type { ContentRepository } from '../../../domain/repositories/contentRepository';
import { apiClient } from '../client';
import { mapContent } from '../mappers/catalogMapper';

export class ContentApiRepository implements ContentRepository {
  async listContentsByModule(token: string, moduleId: string): Promise<ContentItem[]> {
    const response = await apiClient.request<unknown[]>(`/contents/module/${moduleId}`, { method: 'GET', authToken: token });
    return response.map(mapContent);
  }

  async getFullContent(token: string, contentId: string): Promise<ContentItem> {
    const response = await apiClient.request(`/contents/${contentId}/full`, { method: 'GET', authToken: token });
    return mapContent(response);
  }

  async createContent(token: string, data: { moduleId: string; title: string; type: ContentType; orderIndex: number; isFreePreview?: boolean; durationSeconds?: number }): Promise<ContentItem> {
    const response = await apiClient.request('/contents', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapContent(response);
  }

  async updateContent(token: string, contentId: string, data: Partial<Pick<ContentItem, 'title' | 'orderIndex' | 'isFreePreview' | 'durationSeconds'>>): Promise<ContentItem> {
    const response = await apiClient.request(`/contents/${contentId}`, {
      method: 'PUT',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapContent(response);
  }

  async deleteContent(token: string, contentId: string): Promise<void> {
    await apiClient.request(`/contents/${contentId}`, { method: 'DELETE', authToken: token });
  }

  async reorderContents(token: string, moduleId: string, contentIds: string[]): Promise<void> {
    await apiClient.request('/contents/reorder', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ parentId: moduleId, ids: contentIds }),
    });
  }

  async createOrUpdateContentDetails(token: string, contentId: string, type: ContentType, data: Record<string, unknown>, update = false): Promise<void> {
    if (type !== 'video' && type !== 'text' && type !== 'pdf') {
      return;
    }

    await apiClient.request(`/contents/${contentId}/${type}`, {
      method: update ? 'PUT' : 'POST',
      authToken: token,
      body: JSON.stringify(data),
    });
  }
}