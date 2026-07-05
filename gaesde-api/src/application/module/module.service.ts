import { Injectable, Inject } from '@nestjs/common';
import type { IModuleRepository } from '../../domain/module/module.repository.interface';
import { Module } from '../../domain/module/module.entity';
import { ModuleNotFoundException } from '../../domain/module/module.exceptions';

@Injectable()
export class ModuleService {
  constructor(
    @Inject('IModuleRepository') private moduleRepository: IModuleRepository,
  ) {}

  async create(data: {
    courseId: string;
    title: string;
    orderIndex: number;
    description?: string;
  }): Promise<any> {
    const module = new Module(
      data.courseId,
      data.title,
      data.orderIndex,
      data.description,
    );
    const saved = await this.moduleRepository.save(module);
    return this.mapToResponse(saved);
  }

  async findAll(): Promise<any[]> {
    const modules = await this.moduleRepository.findAll();
    return modules.map(mod => this.mapToResponse(mod));
  }

  async findById(id: string): Promise<any> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new ModuleNotFoundException(id);
    }
    return this.mapToResponse(module);
  }

  async findByCourse(courseId: string): Promise<any[]> {
    const modules = await this.moduleRepository.findByCourse(courseId);
    return modules.map(mod => this.mapToResponse(mod));
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    orderIndex?: number;
  }): Promise<any> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new ModuleNotFoundException(id);
    }

    if (data.title) module.title = data.title;
    if (data.description !== undefined) module.description = data.description;
    if (data.orderIndex !== undefined) module.orderIndex = data.orderIndex;

    const updated = await this.moduleRepository.update(id, module);
    if (!updated) {
      throw new ModuleNotFoundException(id);
    }
    return this.mapToResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new ModuleNotFoundException(id);
    }
    await this.moduleRepository.delete(id);
  }

  async reorderModules(courseId: string, moduleIds: string[]): Promise<void> {
    await this.moduleRepository.reorderModules(courseId, moduleIds);
  }

  private mapToResponse(module: Module): any {
    return module.toJSON();
  }
}
