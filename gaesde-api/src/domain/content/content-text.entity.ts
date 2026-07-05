export class ContentText {
  private _id: string;
  private _contentId: string;
  private _body: string;
  private _createdAt: Date;

  constructor(contentId: string, body: string) {
    this.validateBody(body);
    
    this._contentId = contentId;
    this._body = body;
    this._createdAt = new Date();
  }

  private validateBody(body: string): void {
    if (!body || body.trim().length < 1) {
      throw new Error('Content body cannot be empty');
    }
  }

  get id(): string { return this._id; }
  get contentId(): string { return this._contentId; }
  get body(): string { return this._body; }
  get createdAt(): Date { return this._createdAt; }

  set id(id: string) { this._id = id; }
  set body(body: string) {
    this.validateBody(body);
    this._body = body;
  }

  toJSON() {
    return {
      id: this._id,
      contentId: this._contentId,
      body: this._body,
      createdAt: this._createdAt,
    };
  }
}
