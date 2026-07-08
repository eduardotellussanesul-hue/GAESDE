import type { LoginInput, AuthSession } from '../../../domain/entities/auth';
import type { AuthRepository } from '../../../domain/repositories/authRepository';

export class LoginUseCase {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  execute(input: LoginInput): Promise<AuthSession> {
    return this.authRepository.login(input);
  }
}
