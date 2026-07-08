import type { Role } from '../entities/role';

export interface RoleRepository {
  listRoles(token: string): Promise<Role[]>;
}
