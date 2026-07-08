import type { CategoryRepository } from '../../../domain/repositories/categoryRepository';
import type { Category } from '../../../domain/entities/category';
import { apiClient } from '../client';
import { mapCategory } from '../mappers/catalogMapper';

export class CategoryApiRepository implements CategoryRepository {
  async listCategories(token: string): Promise<Category[]> {
    const response = await apiClient.request<unknown[]>('/categories', { method: 'GET', authToken: token });
    return response.map(mapCategory);
  }

  async createCategory(token: string, data: { name: string; slug: string; parentId?: string | null }): Promise<Category> {
    const response = await apiClient.request('/categories', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapCategory(response);
  }
}