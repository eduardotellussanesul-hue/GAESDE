import type { Role } from '../../../domain/entities/role';

export function toRole(raw: Record<string, unknown>): Role {
  return {
    id: String(raw.id),
    name: String(raw.name),
    slug: String(raw.slug),
    description: raw.description ? String(raw.description) : undefined,
  };
}
