import { Injectable, Inject } from '@nestjs/common';
import type { IRoleRepository } from '../../domain/role/role.repository.interface';
import { Role } from '../../domain/role/role.entity';
import { RoleNotFoundException, RoleAlreadyExistsException } from '../../domain/role/role.exceptions';

@Injectable()
export class RoleService {
  constructor(
    @Inject('IRoleRepository') private roleRepository: IRoleRepository,
  ) {}

  async create(data: { name: string; slug: string; description?: string }): Promise<any> {
    // Verificar se já existe role com este slug
    const existingBySlug = await this.roleRepository.findBySlug(data.slug);
    if (existingBySlug) {
      throw new RoleAlreadyExistsException(data.slug);
    }

    const role = new Role(data.name, data.slug, data.description);
    const saved = await this.roleRepository.save(role);
    return this.mapToResponse(saved);
  }

  async findAll(): Promise<any[]> {
    const roles = await this.roleRepository.findAll();
    return roles.map(role => this.mapToResponse(role));
  }

  async findById(id: string): Promise<any> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }
    return this.mapToResponse(role);
  }

  async findBySlug(slug: string): Promise<any> {
    const role = await this.roleRepository.findBySlug(slug);
    if (!role) {
      throw new RoleNotFoundException(slug);
    }
    return this.mapToResponse(role);
  }

  async update(id: string, data: { name?: string; slug?: string; description?: string }): Promise<any> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }

    if (data.name) role.name = data.name;
    if (data.slug) role.slug = data.slug;
    if (data.description !== undefined) role.description = data.description;

    const updated = await this.roleRepository.update(id, role);
    if (!updated) {
      throw new RoleNotFoundException(id);
    }
    return this.mapToResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }
    await this.roleRepository.delete(id);
  }

  private mapToResponse(role: Role): any {
    return {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      createdAt: role.createdAt,
    };
  }
}
