export class Role {
  private _id: string;
  private _name: string;
  private _slug: string;
  private _description?: string;
  private _createdAt: Date;

  constructor(name: string, slug: string, description?: string) {
    this.validateName(name);
    this.validateSlug(slug);
    
    this._name = name;
    this._slug = slug;
    this._description = description;
    this._createdAt = new Date();
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Role name must be at least 2 characters');
    }
    if (name.length > 50) {
      throw new Error('Role name must be at most 50 characters');
    }
  }

  private validateSlug(slug: string): void {
    if (!slug || slug.trim().length < 2) {
      throw new Error('Role slug must be at least 2 characters');
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Role slug must contain only lowercase letters, numbers and hyphens');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get slug(): string { return this._slug; }
  get description(): string | undefined { return this._description; }
  get createdAt(): Date { return this._createdAt; }

  // Setters
  set id(id: string) { this._id = id; }
  set name(name: string) {
    this.validateName(name);
    this._name = name;
  }
  set slug(slug: string) {
    this.validateSlug(slug);
    this._slug = slug;
  }
  set description(description: string | undefined) {
    if (description && description.length > 500) {
      throw new Error('Description must be at most 500 characters');
    }
    this._description = description;
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      slug: this._slug,
      description: this._description,
      createdAt: this._createdAt,
    };
  }
}
