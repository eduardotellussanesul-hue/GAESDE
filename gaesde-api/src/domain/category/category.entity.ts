export class Category {
  private _id: string;
  private _name: string;
  private _slug: string;
  private _parentId?: string;
  private _createdAt: Date;

  constructor(name: string, slug: string, parentId?: string) {
    this.validateName(name);
    this.validateSlug(slug);
    
    this._name = name;
    this._slug = slug;
    this._parentId = parentId;
    this._createdAt = new Date();
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Category name must be at least 2 characters');
    }
    if (name.length > 100) {
      throw new Error('Category name must be at most 100 characters');
    }
  }

  private validateSlug(slug: string): void {
    if (!slug || slug.trim().length < 2) {
      throw new Error('Category slug must be at least 2 characters');
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Category slug must contain only lowercase letters, numbers and hyphens');
    }
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get slug(): string { return this._slug; }
  get parentId(): string | undefined { return this._parentId; }
  get createdAt(): Date { return this._createdAt; }

  set id(id: string) { this._id = id; }
  set name(name: string) {
    this.validateName(name);
    this._name = name;
  }
  set slug(slug: string) {
    this.validateSlug(slug);
    this._slug = slug;
  }
  set parentId(parentId: string | undefined) { this._parentId = parentId; }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      slug: this._slug,
      parentId: this._parentId,
      createdAt: this._createdAt,
    };
  }
}
