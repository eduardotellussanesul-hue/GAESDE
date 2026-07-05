export class Quiz {
  private _id: string;
  private _contentId: string;
  private _timeLimitMinutes?: number;
  private _passingScorePercentage: number;
  private _attemptsAllowed: number;
  private _shuffleQuestions: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    contentId: string,
    passingScorePercentage: number = 60,
    attemptsAllowed: number = 1,
    shuffleQuestions: boolean = false,
    timeLimitMinutes?: number,
  ) {
    this.validateContentId(contentId);
    this.validatePassingScore(passingScorePercentage);
    this.validateAttemptsAllowed(attemptsAllowed);
    
    this._contentId = contentId;
    this._passingScorePercentage = passingScorePercentage;
    this._attemptsAllowed = attemptsAllowed;
    this._shuffleQuestions = shuffleQuestions;
    this._timeLimitMinutes = timeLimitMinutes;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  private validateContentId(contentId: string): void {
    if (!contentId || contentId.trim().length < 1) {
      throw new Error('Content ID is required');
    }
  }

  private validatePassingScore(score: number): void {
    if (score < 0 || score > 100) {
      throw new Error('Passing score must be between 0 and 100');
    }
  }

  private validateAttemptsAllowed(attempts: number): void {
    if (attempts < 1) {
      throw new Error('Attempts allowed must be at least 1');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get contentId(): string { return this._contentId; }
  get timeLimitMinutes(): number | undefined { return this._timeLimitMinutes; }
  get passingScorePercentage(): number { return this._passingScorePercentage; }
  get attemptsAllowed(): number { return this._attemptsAllowed; }
  get shuffleQuestions(): boolean { return this._shuffleQuestions; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Setters
  set id(id: string) { this._id = id; }
  set timeLimitMinutes(timeLimit: number | undefined) {
    if (timeLimit !== undefined && timeLimit < 0) {
      throw new Error('Time limit must be greater than 0');
    }
    this._timeLimitMinutes = timeLimit;
    this._updatedAt = new Date();
  }
  set passingScorePercentage(score: number) {
    this.validatePassingScore(score);
    this._passingScorePercentage = score;
    this._updatedAt = new Date();
  }
  set attemptsAllowed(attempts: number) {
    this.validateAttemptsAllowed(attempts);
    this._attemptsAllowed = attempts;
    this._updatedAt = new Date();
  }
  set shuffleQuestions(shuffle: boolean) {
    this._shuffleQuestions = shuffle;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      contentId: this._contentId,
      timeLimitMinutes: this._timeLimitMinutes,
      passingScorePercentage: this._passingScorePercentage,
      attemptsAllowed: this._attemptsAllowed,
      shuffleQuestions: this._shuffleQuestions,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
