export enum CourseStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class Course {
  private _id: string;
  private _title: string;
  private _slug: string;
  private _description?: string;
  private _coverImage?: string;
  private _price: number;
  private _status: CourseStatus;
  private _level: CourseLevel;
  private _instructorId: string;
  private _categoryId?: string;
  private _publishedAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt?: Date;

  constructor(
    title: string,
    slug: string,
    instructorId: string,
    level: CourseLevel,
    price: number = 0,
    description?: string,
    coverImage?: string,
    categoryId?: string,
    status: CourseStatus = CourseStatus.DRAFT,
  ) {
    this.validateTitle(title);
    this.validateSlug(slug);
    this.validatePrice(price);
    
    this._title = title;
    this._slug = slug;
    this._instructorId = instructorId;
    this._level = level;
    this._price = price;
    this._description = description;
    this._coverImage = coverImage;
    this._categoryId = categoryId;
    this._status = status;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length < 3) {
      throw new Error('Course title must be at least 3 characters');
    }
    if (title.length > 200) {
      throw new Error('Course title must be at most 200 characters');
    }
  }

  private validateSlug(slug: string): void {
    if (!slug || slug.trim().length < 3) {
      throw new Error('Course slug must be at least 3 characters');
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Course slug must contain only lowercase letters, numbers and hyphens');
    }
  }

  private validatePrice(price: number): void {
    if (price < 0) {
      throw new Error('Price must be greater than or equal to 0');
    }
  }

  get id(): string { return this._id; }
  get title(): string { return this._title; }
  get slug(): string { return this._slug; }
  get description(): string | undefined { return this._description; }
  get coverImage(): string | undefined { return this._coverImage; }
  get price(): number { return this._price; }
  get status(): CourseStatus { return this._status; }
  get level(): CourseLevel { return this._level; }
  get instructorId(): string { return this._instructorId; }
  get categoryId(): string | undefined { return this._categoryId; }
  get publishedAt(): Date | undefined { return this._publishedAt; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get deletedAt(): Date | undefined { return this._deletedAt; }
  get isPublished(): boolean { return this._status === CourseStatus.PUBLISHED; }
  get isFree(): boolean { return this._price === 0; }

  set id(id: string) { this._id = id; }
  set title(title: string) {
    this.validateTitle(title);
    this._title = title;
    this._updatedAt = new Date();
  }
  set slug(slug: string) {
    this.validateSlug(slug);
    this._slug = slug;
    this._updatedAt = new Date();
  }
  set description(description: string | undefined) {
    if (description && description.length > 5000) {
      throw new Error('Description must be at most 5000 characters');
    }
    this._description = description;
    this._updatedAt = new Date();
  }
  set coverImage(coverImage: string | undefined) {
    this._coverImage = coverImage;
    this._updatedAt = new Date();
  }
  set price(price: number) {
    this.validatePrice(price);
    this._price = price;
    this._updatedAt = new Date();
  }
  set status(status: CourseStatus) {
    this._status = status;
    if (status === CourseStatus.PUBLISHED && !this._publishedAt) {
      this._publishedAt = new Date();
    }
    this._updatedAt = new Date();
  }
  set level(level: CourseLevel) {
    this._level = level;
    this._updatedAt = new Date();
  }
  set categoryId(categoryId: string | undefined) {
    this._categoryId = categoryId;
    this._updatedAt = new Date();
  }

  publish(): void {
    if (this._status === CourseStatus.PUBLISHED) {
      throw new Error('Course is already published');
    }
    this._status = CourseStatus.PUBLISHED;
    this._publishedAt = new Date();
    this._updatedAt = new Date();
  }

  archive(): void {
    if (this._status === CourseStatus.ARCHIVED) {
      throw new Error('Course is already archived');
    }
    this._status = CourseStatus.ARCHIVED;
    this._updatedAt = new Date();
  }

  softDelete(): void {
    if (this._deletedAt) {
      throw new Error('Course is already deleted');
    }
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  restore(): void {
    if (!this._deletedAt) {
      throw new Error('Course is not deleted');
    }
    this._deletedAt = undefined;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      title: this._title,
      slug: this._slug,
      description: this._description,
      coverImage: this._coverImage,
      price: this._price,
      status: this._status,
      level: this._level,
      instructorId: this._instructorId,
      categoryId: this._categoryId,
      publishedAt: this._publishedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
      isPublished: this.isPublished,
      isFree: this.isFree,
    };
  }
}
