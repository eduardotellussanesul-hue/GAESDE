import type { Role } from '../../../domain/entities/role';
import type { UserRoleRepository } from '../../../domain/repositories/userRoleRepository';

export class GetUserRolesUseCase {
  private readonly userRoleRepository: UserRoleRepository;

  constructor(userRoleRepository: UserRoleRepository) {
    this.userRoleRepository = userRoleRepository;
  }

  execute(token: string, userId: string): Promise<Role[]> {
    return this.userRoleRepository.getUserRoles(token, userId);
  }
}
