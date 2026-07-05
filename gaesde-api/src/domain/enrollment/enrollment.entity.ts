export enum EnrollmentStatus {
  PENDING_PAYMENT = 'pending_payment',
  ACTIVE = 'active',
  DROPPED = 'dropped',
  COMPLETED = 'completed',
}

export class Enrollment {
  private _id: string;
  private _userId: string;
  private _courseId: string;
  private _status: EnrollmentStatus;
  private _progressPercentage: number;
  private _enrolledAt: Date;
  private _expiresAt?: Date;
  private _lastAccessedAt?: Date;

  constructor(
    userId: string,
    courseId: string,
    status: EnrollmentStatus = EnrollmentStatus.ACTIVE,
    progressPercentage: number = 0,
    expiresAt?: Date,
  ) {
    this.validateUserId(userId);
    this.validateCourseId(courseId);
    this.validateProgress(progressPercentage);
    
    this._userId = userId;
    this._courseId = courseId;
    this._status = status;
    this._progressPercentage = progressPercentage;
    this._expiresAt = expiresAt;
    this._enrolledAt = new Date();
    this._lastAccessedAt = new Date();
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length < 1) {
      throw new Error('User ID is required');
    }
  }

  private validateCourseId(courseId: string): void {
    if (!courseId || courseId.trim().length < 1) {
      throw new Error('Course ID is required');
    }
  }

  private validateProgress(progress: number): void {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get courseId(): string { return this._courseId; }
  get status(): EnrollmentStatus { return this._status; }
  get progressPercentage(): number { return this._progressPercentage; }
  get enrolledAt(): Date { return this._enrolledAt; }
  get expiresAt(): Date | undefined { return this._expiresAt; }
  get lastAccessedAt(): Date | undefined { return this._lastAccessedAt; }
  get isActive(): boolean { return this._status === EnrollmentStatus.ACTIVE; }
  get isCompleted(): boolean { return this._status === EnrollmentStatus.COMPLETED; }
  get isExpired(): boolean { 
    if (!this._expiresAt) return false;
    return new Date() > this._expiresAt;
  }

  // Setters
  set id(id: string) { this._id = id; }
  
  set status(status: EnrollmentStatus) {
    this._status = status;
    this._lastAccessedAt = new Date();
  }

  set progressPercentage(progress: number) {
    this.validateProgress(progress);
    this._progressPercentage = progress;
    this._lastAccessedAt = new Date();
    
    // Se progresso for 100%, marcar como concluído
    if (progress === 100 && this._status !== EnrollmentStatus.COMPLETED) {
      this._status = EnrollmentStatus.COMPLETED;
    }
  }

  set expiresAt(expiresAt: Date | undefined) {
    this._expiresAt = expiresAt;
  }

  updateLastAccessed(): void {
    this._lastAccessedAt = new Date();
  }

  activate(): void {
    if (this._status === EnrollmentStatus.ACTIVE) {
      throw new Error('Enrollment is already active');
    }
    this._status = EnrollmentStatus.ACTIVE;
    this._lastAccessedAt = new Date();
  }

  drop(): void {
    if (this._status === EnrollmentStatus.DROPPED) {
      throw new Error('Enrollment is already dropped');
    }
    this._status = EnrollmentStatus.DROPPED;
    this._lastAccessedAt = new Date();
  }

  complete(): void {
    if (this._status === EnrollmentStatus.COMPLETED) {
      throw new Error('Enrollment is already completed');
    }
    this._status = EnrollmentStatus.COMPLETED;
    this._progressPercentage = 100;
    this._lastAccessedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      userId: this._userId,
      courseId: this._courseId,
      status: this._status,
      progressPercentage: this._progressPercentage,
      enrolledAt: this._enrolledAt,
      expiresAt: this._expiresAt,
      lastAccessedAt: this._lastAccessedAt,
      isActive: this.isActive,
      isCompleted: this.isCompleted,
      isExpired: this.isExpired,
    };
  }
}
