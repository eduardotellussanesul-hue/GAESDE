import type { User } from './user';

export type AuthSession = {
  accessToken: string;
  user: User;
  isAdmin: boolean;
  isInstructor: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
};
