export class Image {
  private _id: string;
  private _url: string;
  private _publicId: string;
  private _userId: string;
  private _metadata?: Record<string, any>;
  private _createdAt: Date;

  constructor(url: string, publicId: string, userId: string, metadata?: Record<string, any>) {
    this.validateUrl(url);
    this.validatePublicId(publicId);
    this.validateUserId(userId);
    
    this._url = url;
    this._publicId = publicId;
    this._userId = userId;
    this._metadata = metadata;
    this._createdAt = new Date();
  }

  private validateUrl(url: string): void {
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid URL format');
    }
  }

  private validatePublicId(publicId: string): void {
    if (!publicId || publicId.trim().length < 1) {
      throw new Error('Invalid public ID');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length < 1) {
      throw new Error('Invalid user ID');
    }
  }

  get id(): string { return this._id; }
  get url(): string { return this._url; }
  get publicId(): string { return this._publicId; }
  get userId(): string { return this._userId; }
  get metadata(): Record<string, any> | undefined { return this._metadata; }
  get createdAt(): Date { return this._createdAt; }

  set id(id: string) { this._id = id; }
  set url(url: string) { 
    this.validateUrl(url);
    this._url = url; 
  }
  set publicId(publicId: string) { 
    this.validatePublicId(publicId);
    this._publicId = publicId; 
  }

  toJSON() {
    return {
      id: this._id,
      url: this._url,
      publicId: this._publicId,
      userId: this._userId,
      metadata: this._metadata,
      createdAt: this._createdAt,
    };
  }
}
