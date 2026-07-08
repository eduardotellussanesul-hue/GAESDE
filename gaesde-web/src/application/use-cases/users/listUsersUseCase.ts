import type { User } from '../../../domain/entities/user';
import type { UserRepository } from '../../../domain/repositories/userRepository';

export class ListUsersUseCase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  execute(token: string): Promise<User[]> {
    return this.userRepository.listUsers(token);
  }
}
