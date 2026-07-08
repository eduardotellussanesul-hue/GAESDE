import type { User } from '../../../domain/entities/user';
import type { UserRepository } from '../../../domain/repositories/userRepository';

export class UpdateProfileUseCase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  execute(
    token: string,
    userId: string,
    data: Partial<Pick<User, 'name' | 'bio'>> & { file?: File },
  ): Promise<User> {
    return this.userRepository.updateProfile(token, userId, data);
  }
}
