import { UserRole } from './user-role.entity';

export interface IUserRoleRepository {
  save(userRole: UserRole): Promise<UserRole>;
  findById(id: string): Promise<UserRole | null>;
  findByUser(userId: string): Promise<UserRole[]>;
  findByRole(roleId: string): Promise<UserRole[]>;
  findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null>;
  findAll(): Promise<UserRole[]>;
  delete(id: string): Promise<void>;
  deleteByUser(userId: string): Promise<void>;
  deleteByRole(roleId: string): Promise<void>;
}
