import { Role } from './role.entity';

export interface IRoleRepository {
  save(role: Role): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findBySlug(slug: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  update(id: string, data: Partial<Role>): Promise<Role | null>;
  delete(id: string): Promise<void>;
}
