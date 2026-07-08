import type { ModuleItem } from '../../../domain/entities/moduleItem';
import type { ModuleRepository } from '../../../domain/repositories/moduleRepository';
import { apiClient } from '../client';
import { mapModule } from '../mappers/catalogMapper';

export class ModuleApiRepository implements ModuleRepository {
  async listModulesByCourse(token: string, courseId: string): Promise<ModuleItem[]> {
    const response = await apiClient.request<unknown[]>(`/modules/course/${courseId}`, { method: 'GET', authToken: token });
    return response.map(mapModule);
  }

  async createModule(token: string, data: { courseId: string; title: string; description?: string; orderIndex: number }): Promise<ModuleItem> {
    const response = await apiClient.request('/modules', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapModule(response);
  }

  async updateModule(token: string, moduleId: string, data: Partial<Pick<ModuleItem, 'title' | 'description' | 'orderIndex'>>): Promise<ModuleItem> {
    const response = await apiClient.request(`/modules/${moduleId}`, {
      method: 'PUT',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapModule(response);
  }

  async deleteModule(token: string, moduleId: string): Promise<void> {
    await apiClient.request(`/modules/${moduleId}`, { method: 'DELETE', authToken: token });
  }

  async reorderModules(token: string, courseId: string, moduleIds: string[]): Promise<void> {
    await apiClient.request('/modules/reorder', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ parentId: courseId, ids: moduleIds }),
    });
  }
}