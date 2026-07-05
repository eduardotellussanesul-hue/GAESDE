export class ContentVideo {
  private _id: string;
  private _contentId: string;
  private _videoUrl: string;
  private _videoDurationSeconds?: number;
  private _createdAt: Date;

  constructor(contentId: string, videoUrl: string, videoDurationSeconds?: number) {
    this.validateVideoUrl(videoUrl);
    
    this._contentId = contentId;
    this._videoUrl = videoUrl;
    this._videoDurationSeconds = videoDurationSeconds;
    this._createdAt = new Date();
  }

  private validateVideoUrl(videoUrl: string): void {
    if (!videoUrl || !videoUrl.startsWith('http')) {
      throw new Error('Invalid video URL');
    }
  }

  get id(): string { return this._id; }
  get contentId(): string { return this._contentId; }
  get videoUrl(): string { return this._videoUrl; }
  get videoDurationSeconds(): number | undefined { return this._videoDurationSeconds; }
  get createdAt(): Date { return this._createdAt; }

  set id(id: string) { this._id = id; }
  set videoUrl(videoUrl: string) {
    this.validateVideoUrl(videoUrl);
    this._videoUrl = videoUrl;
  }
  set videoDurationSeconds(videoDurationSeconds: number | undefined) {
    if (videoDurationSeconds !== undefined && videoDurationSeconds < 0) {
      throw new Error('Video duration must be greater than or equal to 0');
    }
    this._videoDurationSeconds = videoDurationSeconds;
  }

  toJSON() {
    return {
      id: this._id,
      contentId: this._contentId,
      videoUrl: this._videoUrl,
      videoDurationSeconds: this._videoDurationSeconds,
      createdAt: this._createdAt,
    };
  }
}
