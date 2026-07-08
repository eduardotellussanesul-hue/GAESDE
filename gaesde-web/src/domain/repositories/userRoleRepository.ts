import type { Role } from '../entities/role';

export interface UserRoleRepository {
  isAdmin(token: string, userId: string): Promise<boolean>;
  getUserRoles(token: string, userId: string): Promise<Role[]>;
  assignRole(token: string, userId: string, roleId: string): Promise<void>;
  removeRole(token: string, userId: string, roleId: string): Promise<void>;
}
