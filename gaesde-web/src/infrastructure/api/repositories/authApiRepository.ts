import type { AuthRepository } from '../../../domain/repositories/authRepository';
import type { AuthSession, LoginInput } from '../../../domain/entities/auth';
import { apiClient } from '../client';
import { toUser } from '../mappers/userMapper';

export class AuthApiRepository implements AuthRepository {
  async login(input: LoginInput): Promise<AuthSession> {
    const data = await apiClient.request<{ access_token: string; user: Record<string, unknown> }>(
      '/users/login',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    );

    const user = toUser(data.user);
    const isAdmin = await this.checkAdmin(data.access_token, user.id);
    const isInstructor = await this.checkRole(data.access_token, user.id, 'instructor');

    return {
      accessToken: data.access_token,
      user,
      isAdmin,
      isInstructor,
    };
  }

  async restoreSession(token: string): Promise<AuthSession> {
    const userData = await apiClient.request<Record<string, unknown>>('/users/profile', {
      method: 'GET',
      authToken: token,
    });

    const user = toUser(userData);
    const isAdmin = await this.checkAdmin(token, user.id);
    const isInstructor = await this.checkRole(token, user.id, 'instructor');

    return {
      accessToken: token,
      user,
      isAdmin,
      isInstructor,
    };
  }

  private async checkAdmin(token: string, userId: string): Promise<boolean> {
    return this.checkRole(token, userId, 'admin');
  }

  private async checkRole(token: string, userId: string, roleSlug: string): Promise<boolean> {
    try {
      const result = await apiClient.request<{ hasRole: boolean }>(
        `/user-roles/has-role/${userId}/${roleSlug}`,
        {
          method: 'GET',
          authToken: token,
        },
      );
      return Boolean(result.hasRole);
    } catch {
      return false;
    }
  }
}
