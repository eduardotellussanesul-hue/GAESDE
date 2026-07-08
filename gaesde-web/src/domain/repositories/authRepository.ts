import type { LoginInput, AuthSession } from '../entities/auth';

export interface AuthRepository {
  login(input: LoginInput): Promise<AuthSession>;
  restoreSession(token: string): Promise<AuthSession>;
}
