import type { UserRepository } from '../../../domain/repositories/userRepository';
import type { User } from '../../../domain/entities/user';

type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  bio?: string;
  file?: File;
};

export class CreateUserUseCase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  execute(token: string, data: CreateUserInput): Promise<User> {
    return this.userRepository.createUser(token, data);
  }
}
