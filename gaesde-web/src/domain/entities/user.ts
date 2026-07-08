export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};
