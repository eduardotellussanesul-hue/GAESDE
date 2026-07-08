import type { User } from '../../../domain/entities/user';

export function toUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw.id),
    email: String(raw.email),
    name: String(raw.name),
    avatarUrl: raw.avatarUrl ? String(raw.avatarUrl) : null,
    bio: raw.bio ? String(raw.bio) : null,
    emailVerifiedAt: raw.emailVerifiedAt ? String(raw.emailVerifiedAt) : null,
    lastLoginAt: raw.lastLoginAt ? String(raw.lastLoginAt) : null,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}
