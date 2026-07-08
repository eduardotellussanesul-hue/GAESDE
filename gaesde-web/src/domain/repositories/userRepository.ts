import type { User } from '../entities/user';

export interface UserRepository {
  createUser(
    token: string,
    data: {
      email: string;
      password: string;
      name: string;
      bio?: string;
      file?: File;
    },
  ): Promise<User>;
  getProfile(token: string): Promise<User>;
  updateProfile(token: string, userId: string, data: Partial<Pick<User, 'name' | 'bio'>> & { file?: File }): Promise<User>;
  listUsers(token: string): Promise<User[]>;
  deleteUser(token: string, userId: string): Promise<void>;
  hardDeleteUser(token: string, userId: string): Promise<void>;
}
