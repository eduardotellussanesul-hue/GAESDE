import type { AuthSession } from '../../../domain/entities/auth';
import type { AuthRepository } from '../../../domain/repositories/authRepository';

export class RestoreSessionUseCase {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  execute(token: string): Promise<AuthSession> {
    return this.authRepository.restoreSession(token);
  }
}
