import { Module } from './module.entity';

export interface IModuleRepository {
  save(module: Module): Promise<Module>;
  findById(id: string): Promise<Module | null>;
  findByCourse(courseId: string): Promise<Module[]>;
  findAll(): Promise<Module[]>;
  update(id: string, data: Partial<Module>): Promise<Module | null>;
  delete(id: string): Promise<void>;
  reorderModules(courseId: string, moduleIds: string[]): Promise<void>;
}
