export class UserRoleNotFoundException extends Error {
  constructor(id: string) {
    super(`UserRole with ID ${id} not found`);
    this.name = 'UserRoleNotFoundException';
  }
}

export class UserRoleAlreadyExistsException extends Error {
  constructor(userId: string, roleId: string) {
    super(`User ${userId} already has role ${roleId}`);
    this.name = 'UserRoleAlreadyExistsException';
  }
}
