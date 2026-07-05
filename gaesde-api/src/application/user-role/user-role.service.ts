import { Injectable, Inject } from '@nestjs/common';
import type { IUserRoleRepository } from '../../domain/user-role/user-role.repository.interface';
import type { IRoleRepository } from '../../domain/role/role.repository.interface';
import type { IUserRepository } from '../../domain/user/user.repository.interface';
import { UserRole } from '../../domain/user-role/user-role.entity';
import { UserRoleAlreadyExistsException, UserRoleNotFoundException } from '../../domain/user-role/user-role.exceptions';
import { UserNotFoundException } from '../../domain/user/user.exceptions';
import { RoleNotFoundException } from '../../domain/role/role.exceptions';

@Injectable()
export class UserRoleService {
  constructor(
    @Inject('IUserRoleRepository') private userRoleRepository: IUserRoleRepository,
    @Inject('IRoleRepository') private roleRepository: IRoleRepository,
    @Inject('IUserRepository') private userRepository: IUserRepository,
  ) {}

  async assignRole(userId: string, roleId: string): Promise<any> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Verificar se role existe
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new RoleNotFoundException(roleId);
    }

    // Verificar se já tem a role
    const existing = await this.userRoleRepository.findByUserAndRole(userId, roleId);
    if (existing) {
      throw new UserRoleAlreadyExistsException(userId, roleId);
    }

    const userRole = new UserRole(userId, roleId);
    const saved = await this.userRoleRepository.save(userRole);
    return {
      id: saved.id,
      userId: saved.userId,
      roleId: saved.roleId,
      createdAt: saved.createdAt,
    };
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const userRole = await this.userRoleRepository.findByUserAndRole(userId, roleId);
    if (!userRole) {
      throw new UserRoleNotFoundException(`User ${userId} does not have role ${roleId}`);
    }
    await this.userRoleRepository.delete(userRole.id);
  }

  async getUserRoles(userId: string): Promise<any[]> {
    const userRoles = await this.userRoleRepository.findByUser(userId);
    const roles = await Promise.all(
      userRoles.map(async (ur) => {
        const role = await this.roleRepository.findById(ur.roleId);
        return {
          id: ur.id,
          userId: ur.userId,
          roleId: ur.roleId,
          role: role ? {
            id: role.id,
            name: role.name,
            slug: role.slug,
            description: role.description,
          } : null,
          createdAt: ur.createdAt,
        };
      })
    );
    return roles;
  }

  async getUsersByRole(roleId: string): Promise<any[]> {
    const userRoles = await this.userRoleRepository.findByRole(roleId);
    const users = await Promise.all(
      userRoles.map(async (ur) => {
        const user = await this.userRepository.findById(ur.userId);
        return {
          id: ur.id,
          userId: ur.userId,
          roleId: ur.roleId,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
          } : null,
          createdAt: ur.createdAt,
        };
      })
    );
    return users;
  }

  async hasRole(userId: string, roleSlug: string): Promise<boolean> {
    const userRoles = await this.userRoleRepository.findByUser(userId);
    for (const ur of userRoles) {
      const role = await this.roleRepository.findById(ur.roleId);
      if (role && role.slug === roleSlug) {
        return true;
      }
    }
    return false;
  }
}
