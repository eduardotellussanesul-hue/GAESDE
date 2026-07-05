export class ContentPdf {
  private _id: string;
  private _contentId: string;
  private _fileUrl: string;
  private _fileSizeBytes?: number;
  private _createdAt: Date;

  constructor(contentId: string, fileUrl: string, fileSizeBytes?: number) {
    this.validateFileUrl(fileUrl);
    
    this._contentId = contentId;
    this._fileUrl = fileUrl;
    this._fileSizeBytes = fileSizeBytes;
    this._createdAt = new Date();
  }

  private validateFileUrl(fileUrl: string): void {
    if (!fileUrl || !fileUrl.startsWith('http')) {
      throw new Error('Invalid file URL');
    }
  }

  get id(): string { return this._id; }
  get contentId(): string { return this._contentId; }
  get fileUrl(): string { return this._fileUrl; }
  get fileSizeBytes(): number | undefined { return this._fileSizeBytes; }
  get createdAt(): Date { return this._createdAt; }

  set id(id: string) { this._id = id; }
  set fileUrl(fileUrl: string) {
    this.validateFileUrl(fileUrl);
    this._fileUrl = fileUrl;
  }
  set fileSizeBytes(fileSizeBytes: number | undefined) {
    if (fileSizeBytes !== undefined && fileSizeBytes < 0) {
      throw new Error('File size must be greater than or equal to 0');
    }
    this._fileSizeBytes = fileSizeBytes;
  }

  toJSON() {
    return {
      id: this._id,
      contentId: this._contentId,
      fileUrl: this._fileUrl,
      fileSizeBytes: this._fileSizeBytes,
      createdAt: this._createdAt,
    };
  }
}
