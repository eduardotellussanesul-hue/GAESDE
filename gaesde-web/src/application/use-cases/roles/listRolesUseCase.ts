import type { Role } from '../../../domain/entities/role';
import type { RoleRepository } from '../../../domain/repositories/roleRepository';

export class ListRolesUseCase {
  private readonly roleRepository: RoleRepository;

  constructor(roleRepository: RoleRepository) {
    this.roleRepository = roleRepository;
  }

  execute(token: string): Promise<Role[]> {
    return this.roleRepository.listRoles(token);
  }
}
