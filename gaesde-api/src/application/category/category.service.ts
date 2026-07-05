import { Injectable, Inject } from '@nestjs/common';
import type { ICategoryRepository } from '../../domain/category/category.repository.interface';
import { Category } from '../../domain/category/category.entity';
import { CategoryNotFoundException, CategoryAlreadyExistsException } from '../../domain/category/category.exceptions';

@Injectable()
export class CategoryService {
  constructor(
    @Inject('ICategoryRepository') private categoryRepository: ICategoryRepository,
  ) {}

  async create(data: { name: string; slug: string; parentId?: string }): Promise<any> {
    const existing = await this.categoryRepository.findBySlug(data.slug);
    if (existing) {
      throw new CategoryAlreadyExistsException(data.slug);
    }

    const category = new Category(data.name, data.slug, data.parentId);
    const saved = await this.categoryRepository.save(category);
    return this.mapToResponse(saved);
  }

  async findAll(): Promise<any[]> {
    const categories = await this.categoryRepository.findAll();
    return categories.map(cat => this.mapToResponse(cat));
  }

  async findById(id: string): Promise<any> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    return this.mapToResponse(category);
  }

  async findBySlug(slug: string): Promise<any> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new CategoryNotFoundException(slug);
    }
    return this.mapToResponse(category);
  }

  async findParents(): Promise<any[]> {
    const categories = await this.categoryRepository.findParents();
    return categories.map(cat => this.mapToResponse(cat));
  }

  async findChildren(parentId: string): Promise<any[]> {
    const categories = await this.categoryRepository.findChildren(parentId);
    return categories.map(cat => this.mapToResponse(cat));
  }

  async update(id: string, data: { name?: string; slug?: string; parentId?: string }): Promise<any> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    if (data.name) category.name = data.name;
    if (data.slug) category.slug = data.slug;
    if (data.parentId !== undefined) category.parentId = data.parentId;

    const updated = await this.categoryRepository.update(id, category);
    if (!updated) {
      throw new CategoryNotFoundException(id);
    }
    return this.mapToResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    await this.categoryRepository.delete(id);
  }

  private mapToResponse(category: Category): any {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || null,
      createdAt: category.createdAt,
    };
  }
}
