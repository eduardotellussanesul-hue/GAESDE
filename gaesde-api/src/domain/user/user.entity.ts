export class User {
  private _id: string;
  private _name: string;
  private _email: string;
  private _passwordHash: string;
  private _avatarUrl?: string;
  private _bio?: string;
  private _emailVerifiedAt?: Date;
  private _lastLoginAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt?: Date;

  constructor(
    name: string,
    email: string,
    passwordHash: string,
    avatarUrl?: string,
    bio?: string,
    emailVerifiedAt?: Date,
    lastLoginAt?: Date,
  ) {
    this.validateName(name);
    this.validateEmail(email);
    
    this._name = name;
    this._email = email;
    this._passwordHash = passwordHash;
    this._avatarUrl = avatarUrl;
    this._bio = bio;
    this._emailVerifiedAt = emailVerifiedAt;
    this._lastLoginAt = lastLoginAt;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._deletedAt = null;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (name.length > 100) {
      throw new Error('Name must be at most 100 characters');
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    if (email.length > 255) {
      throw new Error('Email must be at most 255 characters');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get passwordHash(): string { return this._passwordHash; }
  get avatarUrl(): string | undefined { return this._avatarUrl; }
  get bio(): string | undefined { return this._bio; }
  get emailVerifiedAt(): Date | undefined { return this._emailVerifiedAt; }
  get lastLoginAt(): Date | undefined { return this._lastLoginAt; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get deletedAt(): Date | undefined { return this._deletedAt; }
  get isDeleted(): boolean { return !!this._deletedAt; }
  get isEmailVerified(): boolean { return !!this._emailVerifiedAt; }

  // Setters
  set id(id: string) { this._id = id; }
  
  set name(name: string) {
    this.validateName(name);
    this._name = name;
    this._updatedAt = new Date();
  }
  
  set email(email: string) {
    this.validateEmail(email);
    this._email = email;
    this._updatedAt = new Date();
  }
  
  set passwordHash(passwordHash: string) {
    this._passwordHash = passwordHash;
    this._updatedAt = new Date();
  }
  
  set avatarUrl(avatarUrl: string | undefined) {
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      throw new Error('Avatar URL must be a valid HTTP URL');
    }
    this._avatarUrl = avatarUrl;
    this._updatedAt = new Date();
  }
  
  set bio(bio: string | undefined) {
    if (bio && bio.length > 500) {
      throw new Error('Bio must be at most 500 characters');
    }
    this._bio = bio;
    this._updatedAt = new Date();
  }

  // Métodos de domínio
  verifyEmail(): void {
    if (this.isEmailVerified) {
      throw new Error('Email already verified');
    }
    this._emailVerifiedAt = new Date();
    this._updatedAt = new Date();
  }

  updateLastLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  softDelete(): void {
    if (this.isDeleted) {
      throw new Error('User already deleted');
    }
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  restore(): void {
    if (!this.isDeleted) {
      throw new Error('User is not deleted');
    }
    this._deletedAt = null;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      avatarUrl: this._avatarUrl,
      bio: this._bio,
      emailVerifiedAt: this._emailVerifiedAt,
      lastLoginAt: this._lastLoginAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
      isDeleted: this.isDeleted,
      isEmailVerified: this.isEmailVerified,
    };
  }
}
