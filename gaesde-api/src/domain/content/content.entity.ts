export enum ContentType {
  VIDEO = 'video',
  TEXT = 'text',
  PDF = 'pdf',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
}

export class Content {
  private _id: string;
  private _moduleId: string;
  private _title: string;
  private _type: ContentType;
  private _orderIndex: number;
  private _isFreePreview: boolean;
  private _durationSeconds?: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    moduleId: string,
    title: string,
    type: ContentType,
    orderIndex: number,
    isFreePreview: boolean = false,
    durationSeconds?: number,
  ) {
    this.validateTitle(title);
    this.validateDuration(durationSeconds);
    
    this._moduleId = moduleId;
    this._title = title;
    this._type = type;
    this._orderIndex = orderIndex;
    this._isFreePreview = isFreePreview;
    this._durationSeconds = durationSeconds;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length < 2) {
      throw new Error('Content title must be at least 2 characters');
    }
    if (title.length > 200) {
      throw new Error('Content title must be at most 200 characters');
    }
  }

  private validateDuration(duration?: number): void {
    if (duration !== undefined && duration < 0) {
      throw new Error('Duration must be greater than or equal to 0');
    }
  }

  get id(): string { return this._id; }
  get moduleId(): string { return this._moduleId; }
  get title(): string { return this._title; }
  get type(): ContentType { return this._type; }
  get orderIndex(): number { return this._orderIndex; }
  get isFreePreview(): boolean { return this._isFreePreview; }
  get durationSeconds(): number | undefined { return this._durationSeconds; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  set id(id: string) { this._id = id; }
  set title(title: string) {
    this.validateTitle(title);
    this._title = title;
    this._updatedAt = new Date();
  }
  set orderIndex(orderIndex: number) {
    if (orderIndex < 0) {
      throw new Error('Order index must be greater than or equal to 0');
    }
    this._orderIndex = orderIndex;
    this._updatedAt = new Date();
  }
  set isFreePreview(isFreePreview: boolean) {
    this._isFreePreview = isFreePreview;
    this._updatedAt = new Date();
  }
  set durationSeconds(durationSeconds: number | undefined) {
    this.validateDuration(durationSeconds);
    this._durationSeconds = durationSeconds;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      moduleId: this._moduleId,
      title: this._title,
      type: this._type,
      orderIndex: this._orderIndex,
      isFreePreview: this._isFreePreview,
      durationSeconds: this._durationSeconds,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
