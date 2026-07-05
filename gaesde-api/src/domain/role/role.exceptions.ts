export class RoleNotFoundException extends Error {
  constructor(id: string) {
    super(`Role with ID ${id} not found`);
    this.name = 'RoleNotFoundException';
  }
}

export class RoleAlreadyExistsException extends Error {
  constructor(slug: string) {
    super(`Role with slug ${slug} already exists`);
    this.name = 'RoleAlreadyExistsException';
  }
}

export class InvalidRoleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRoleException';
  }
}
