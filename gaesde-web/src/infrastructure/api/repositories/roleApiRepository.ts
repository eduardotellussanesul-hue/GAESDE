import type { RoleRepository } from '../../../domain/repositories/roleRepository';
import type { Role } from '../../../domain/entities/role';
import { apiClient } from '../client';
import { toRole } from '../mappers/roleMapper';

export class RoleApiRepository implements RoleRepository {
  async listRoles(token: string): Promise<Role[]> {
    const response = await apiClient.request<Record<string, unknown>[]>('/roles', {
      method: 'GET',
      authToken: token,
    });

    return response.map((item) => toRole(item));
  }
}
