import type { ModuleItem } from '../entities/moduleItem';

export interface ModuleRepository {
  listModulesByCourse(token: string, courseId: string): Promise<ModuleItem[]>;
  createModule(token: string, data: { courseId: string; title: string; description?: string; orderIndex: number }): Promise<ModuleItem>;
  updateModule(token: string, moduleId: string, data: Partial<Pick<ModuleItem, 'title' | 'description' | 'orderIndex'>>): Promise<ModuleItem>;
  deleteModule(token: string, moduleId: string): Promise<void>;
  reorderModules(token: string, courseId: string, moduleIds: string[]): Promise<void>;
}