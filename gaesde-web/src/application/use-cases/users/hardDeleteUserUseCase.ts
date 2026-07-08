import type { UserRepository } from '../../../domain/repositories/userRepository';

export class HardDeleteUserUseCase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  execute(token: string, userId: string): Promise<void> {
    return this.userRepository.hardDeleteUser(token, userId);
  }
}
