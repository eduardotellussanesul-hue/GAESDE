import { Category } from './category.entity';

export interface ICategoryRepository {
  save(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findParents(): Promise<Category[]>;
  findChildren(parentId: string): Promise<Category[]>;
  update(id: string, data: Partial<Category>): Promise<Category | null>;
  delete(id: string): Promise<void>;
}
