import type { UserRepository } from '../../../domain/repositories/userRepository';
import type { User } from '../../../domain/entities/user';
import { apiClient } from '../client';
import { toUser } from '../mappers/userMapper';

export class UserApiRepository implements UserRepository {
  async createUser(
    token: string,
    data: {
      email: string;
      password: string;
      name: string;
      bio?: string;
      file?: File;
    },
  ): Promise<User> {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('name', data.name);
    if (data.bio) {
      formData.append('bio', data.bio);
    }
    if (data.file) {
      formData.append('file', data.file);
    }

    const created = await apiClient.request<Record<string, unknown>>('/users/register', {
      method: 'POST',
      authToken: token,
      body: formData,
    });

    return toUser(created);
  }

  async getProfile(token: string): Promise<User> {
    const data = await apiClient.request<Record<string, unknown>>('/users/profile', {
      method: 'GET',
      authToken: token,
    });
    return toUser(data);
  }

  async updateProfile(
    token: string,
    userId: string,
    data: Partial<Pick<User, 'name' | 'bio'>> & { file?: File },
  ): Promise<User> {
    const formData = new FormData();
    if (data.name !== undefined && data.name !== null) {
      formData.append('name', data.name);
    }
    if (data.bio !== undefined && data.bio !== null) {
      formData.append('bio', data.bio);
    }
    if (data.file) {
      formData.append('file', data.file);
    }

    const updated = await apiClient.request<Record<string, unknown>>(`/users/${userId}`, {
      method: 'PUT',
      authToken: token,
      body: formData,
    });

    return toUser(updated);
  }

  async listUsers(token: string): Promise<User[]> {
    const response = await apiClient.request<Record<string, unknown>[]>('/users', {
      method: 'GET',
      authToken: token,
    });

    return response.map((item) => toUser(item));
  }

  async deleteUser(token: string, userId: string): Promise<void> {
    await apiClient.request<void>(`/users/${userId}`, {
      method: 'DELETE',
      authToken: token,
    });
  }

  async hardDeleteUser(token: string, userId: string): Promise<void> {
    await apiClient.request<void>(`/users/${userId}/hard`, {
      method: 'DELETE',
      authToken: token,
    });
  }
}
