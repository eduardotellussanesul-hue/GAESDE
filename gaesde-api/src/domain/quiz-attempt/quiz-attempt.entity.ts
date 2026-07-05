export enum QuizAttemptStatus {
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  ABANDONED = 'abandoned',
}

export class QuizAttempt {
  private _id: string;
  private _quizId: string;
  private _userId: string;
  private _enrollmentId: string;
  private _status: QuizAttemptStatus;
  private _startedAt: Date;
  private _submittedAt?: Date;
  private _totalScore?: number;
  private _isPassed?: boolean;
  private _createdAt: Date;

  constructor(
    quizId: string,
    userId: string,
    enrollmentId: string,
    status: QuizAttemptStatus = QuizAttemptStatus.IN_PROGRESS,
  ) {
    this.validateQuizId(quizId);
    this.validateUserId(userId);
    this.validateEnrollmentId(enrollmentId);
    
    this._quizId = quizId;
    this._userId = userId;
    this._enrollmentId = enrollmentId;
    this._status = status;
    this._startedAt = new Date();
    this._createdAt = new Date();
  }

  private validateQuizId(quizId: string): void {
    if (!quizId || quizId.trim().length < 1) {
      throw new Error('Quiz ID is required');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length < 1) {
      throw new Error('User ID is required');
    }
  }

  private validateEnrollmentId(enrollmentId: string): void {
    if (!enrollmentId || enrollmentId.trim().length < 1) {
      throw new Error('Enrollment ID is required');
    }
  }

  get id(): string { return this._id; }
  get quizId(): string { return this._quizId; }
  get userId(): string { return this._userId; }
  get enrollmentId(): string { return this._enrollmentId; }
  get status(): QuizAttemptStatus { return this._status; }
  get startedAt(): Date { return this._startedAt; }
  get submittedAt(): Date | undefined { return this._submittedAt; }
  get totalScore(): number | undefined { return this._totalScore; }
  get isPassed(): boolean | undefined { return this._isPassed; }
  get createdAt(): Date { return this._createdAt; }
  get isFinished(): boolean { return this._status === QuizAttemptStatus.FINISHED; }
  get isInProgress(): boolean { return this._status === QuizAttemptStatus.IN_PROGRESS; }

  set id(id: string) { this._id = id; }

  finish(totalScore: number, isPassed: boolean): void {
    if (this._status === QuizAttemptStatus.FINISHED) {
      throw new Error('Quiz attempt is already finished');
    }
    this._status = QuizAttemptStatus.FINISHED;
    this._submittedAt = new Date();
    this._totalScore = totalScore;
    this._isPassed = isPassed;
  }

  abandon(): void {
    if (this._status === QuizAttemptStatus.FINISHED) {
      throw new Error('Cannot abandon a finished quiz attempt');
    }
    this._status = QuizAttemptStatus.ABANDONED;
  }

  toJSON() {
    return {
      id: this._id,
      quizId: this._quizId,
      userId: this._userId,
      enrollmentId: this._enrollmentId,
      status: this._status,
      startedAt: this._startedAt,
      submittedAt: this._submittedAt,
      totalScore: this._totalScore,
      isPassed: this._isPassed,
      createdAt: this._createdAt,
      isFinished: this.isFinished,
      isInProgress: this.isInProgress,
    };
  }
}
