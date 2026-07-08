import type { UserRoleRepository } from '../../../domain/repositories/userRoleRepository';
import type { Role } from '../../../domain/entities/role';
import { apiClient } from '../client';
import { toRole } from '../mappers/roleMapper';

export class UserRoleApiRepository implements UserRoleRepository {
  async isAdmin(token: string, userId: string): Promise<boolean> {
    const result = await apiClient.request<{ hasRole: boolean }>(
      `/user-roles/has-role/${userId}/admin`,
      {
        method: 'GET',
        authToken: token,
      },
    );

    return Boolean(result.hasRole);
  }

  async getUserRoles(token: string, userId: string): Promise<Role[]> {
    const response = await apiClient.request<Array<Record<string, unknown>>>(
      `/user-roles/user/${userId}`,
      {
        method: 'GET',
        authToken: token,
      },
    );

    return response
      .map((item) => item.role)
      .filter((role): role is Record<string, unknown> => Boolean(role && typeof role === 'object'))
      .map((role) => toRole(role));
  }

  async assignRole(token: string, userId: string, roleId: string): Promise<void> {
    await apiClient.request('/user-roles/assign', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ userId, roleId }),
    });
  }

  async removeRole(token: string, userId: string, roleId: string): Promise<void> {
    await apiClient.request(`/user-roles/remove/${userId}/${roleId}`, {
      method: 'DELETE',
      authToken: token,
    });
  }
}
