export class UserRole {
  private _id: string;
  private _userId: string;
  private _roleId: string;
  private _createdAt: Date;

  constructor(userId: string, roleId: string) {
    this.validateUserId(userId);
    this.validateRoleId(roleId);
    
    this._userId = userId;
    this._roleId = roleId;
    this._createdAt = new Date();
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length < 1) {
      throw new Error('User ID is required');
    }
  }

  private validateRoleId(roleId: string): void {
    if (!roleId || roleId.trim().length < 1) {
      throw new Error('Role ID is required');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get roleId(): string { return this._roleId; }
  get createdAt(): Date { return this._createdAt; }

  // Setters
  set id(id: string) { this._id = id; }

  toJSON() {
    return {
      id: this._id,
      userId: this._userId,
      roleId: this._roleId,
      createdAt: this._createdAt,
    };
  }
}
