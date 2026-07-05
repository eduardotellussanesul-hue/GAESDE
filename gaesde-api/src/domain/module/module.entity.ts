export class Module {
  private _id: string;
  private _courseId: string;
  private _title: string;
  private _description?: string;
  private _orderIndex: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    courseId: string,
    title: string,
    orderIndex: number,
    description?: string,
  ) {
    this.validateTitle(title);
    this.validateOrderIndex(orderIndex);
    
    this._courseId = courseId;
    this._title = title;
    this._orderIndex = orderIndex;
    this._description = description;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length < 2) {
      throw new Error('Module title must be at least 2 characters');
    }
    if (title.length > 200) {
      throw new Error('Module title must be at most 200 characters');
    }
  }

  private validateOrderIndex(orderIndex: number): void {
    if (orderIndex < 0) {
      throw new Error('Order index must be greater than or equal to 0');
    }
  }

  get id(): string { return this._id; }
  get courseId(): string { return this._courseId; }
  get title(): string { return this._title; }
  get description(): string | undefined { return this._description; }
  get orderIndex(): number { return this._orderIndex; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  set id(id: string) { this._id = id; }
  set title(title: string) {
    this.validateTitle(title);
    this._title = title;
    this._updatedAt = new Date();
  }
  set description(description: string | undefined) {
    if (description && description.length > 2000) {
      throw new Error('Description must be at most 2000 characters');
    }
    this._description = description;
    this._updatedAt = new Date();
  }
  set orderIndex(orderIndex: number) {
    this.validateOrderIndex(orderIndex);
    this._orderIndex = orderIndex;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      courseId: this._courseId,
      title: this._title,
      description: this._description,
      orderIndex: this._orderIndex,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
