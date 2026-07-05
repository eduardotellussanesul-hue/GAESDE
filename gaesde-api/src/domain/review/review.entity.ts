export class Review {
  private _id: string;
  private _courseId: string;
  private _userId: string;
  private _rating: number;
  private _comment?: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    courseId: string,
    userId: string,
    rating: number,
    comment?: string,
  ) {
    this.validateCourseId(courseId);
    this.validateUserId(userId);
    this.validateRating(rating);
    
    this._courseId = courseId;
    this._userId = userId;
    this._rating = rating;
    this._comment = comment;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  private validateCourseId(courseId: string): void {
    if (!courseId || courseId.trim().length < 1) {
      throw new Error('Course ID is required');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length < 1) {
      throw new Error('User ID is required');
    }
  }

  private validateRating(rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
  }

  get id(): string { return this._id; }
  get courseId(): string { return this._courseId; }
  get userId(): string { return this._userId; }
  get rating(): number { return this._rating; }
  get comment(): string | undefined { return this._comment; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  set id(id: string) { this._id = id; }
  set rating(rating: number) {
    this.validateRating(rating);
    this._rating = rating;
    this._updatedAt = new Date();
  }
  set comment(comment: string | undefined) {
    if (comment && comment.length > 2000) {
      throw new Error('Comment must be at most 2000 characters');
    }
    this._comment = comment;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      courseId: this._courseId,
      userId: this._userId,
      rating: this._rating,
      comment: this._comment,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
