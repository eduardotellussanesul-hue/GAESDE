export class ContentCompletion {
  private _id: string;
  private _userId: string;
  private _contentId: string;
  private _completedAt: Date;

  constructor(userId: string, contentId: string) {
    this.validateUserId(userId);
    this.validateContentId(contentId);
    
    this._userId = userId;
    this._contentId = contentId;
    this._completedAt = new Date();
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length < 1) {
      throw new Error('User ID is required');
    }
  }

  private validateContentId(contentId: string): void {
    if (!contentId || contentId.trim().length < 1) {
      throw new Error('Content ID is required');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get contentId(): string { return this._contentId; }
  get completedAt(): Date { return this._completedAt; }

  // Setters
  set id(id: string) { this._id = id; }

  toJSON() {
    return {
      id: this._id,
      userId: this._userId,
      contentId: this._contentId,
      completedAt: this._completedAt,
    };
  }
}
