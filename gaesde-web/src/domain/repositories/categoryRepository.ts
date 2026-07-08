import type { Category } from '../entities/category';

export interface CategoryRepository {
  listCategories(token: string): Promise<Category[]>;
  createCategory(token: string, data: { name: string; slug: string; parentId?: string | null }): Promise<Category>;
}