import type { UserRoleRepository } from '../../../domain/repositories/userRoleRepository';

export class RemoveRoleUseCase {
  private readonly userRoleRepository: UserRoleRepository;

  constructor(userRoleRepository: UserRoleRepository) {
    this.userRoleRepository = userRoleRepository;
  }

  execute(token: string, userId: string, roleId: string): Promise<void> {
    return this.userRoleRepository.removeRole(token, userId, roleId);
  }
}
