import type { User } from '../../../domain/entities/user';
import type { UserRepository } from '../../../domain/repositories/userRepository';

export class GetProfileUseCase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  execute(token: string): Promise<User> {
    return this.userRepository.getProfile(token);
  }
}
