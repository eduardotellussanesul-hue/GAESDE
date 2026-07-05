export class AssignmentSubmission {
  private _id: string;
  private _contentId: string;
  private _userId: string;
  private _enrollmentId: string;
  private _fileUrl: string;
  private _submittedAt: Date;
  private _grade?: number;
  private _instructorFeedback?: string;
  private _gradedAt?: Date;

  constructor(
    contentId: string,
    userId: string,
    enrollmentId: string,
    fileUrl: string,
  ) {
    this.validateContentId(contentId);
    this.validateUserId(userId);
    this.validateEnrollmentId(enrollmentId);
    this.validateFileUrl(fileUrl);
    
    this._contentId = contentId;
    this._userId = userId;
    this._enrollmentId = enrollmentId;
    this._fileUrl = fileUrl;
    this._submittedAt = new Date();
  }

  private validateContentId(contentId: string): void {
    if (!contentId || contentId.trim().length < 1) {
      throw new Error('Content ID is required');
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

  private validateFileUrl(fileUrl: string): void {
    if (!fileUrl || !fileUrl.startsWith('http')) {
      throw new Error('Invalid file URL');
    }
  }

  get id(): string { return this._id; }
  get contentId(): string { return this._contentId; }
  get userId(): string { return this._userId; }
  get enrollmentId(): string { return this._enrollmentId; }
  get fileUrl(): string { return this._fileUrl; }
  get submittedAt(): Date { return this._submittedAt; }
  get gradeValue(): number | undefined { return this._grade; } // Renomeado para evitar conflito
  get instructorFeedback(): string | undefined { return this._instructorFeedback; }
  get gradedAt(): Date | undefined { return this._gradedAt; }
  get isGraded(): boolean { return this._grade !== undefined; }

  set id(id: string) { this._id = id; }
  set fileUrl(fileUrl: string) {
    this.validateFileUrl(fileUrl);
    this._fileUrl = fileUrl;
  }

  assignGrade(grade: number, feedback?: string): void { // Renomeado de grade() para assignGrade()
    if (this.isGraded) {
      throw new Error('Assignment is already graded');
    }
    if (grade < 0 || grade > 100) {
      throw new Error('Grade must be between 0 and 100');
    }
    this._grade = grade;
    this._instructorFeedback = feedback;
    this._gradedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      contentId: this._contentId,
      userId: this._userId,
      enrollmentId: this._enrollmentId,
      fileUrl: this._fileUrl,
      submittedAt: this._submittedAt,
      grade: this._grade,
      instructorFeedback: this._instructorFeedback,
      gradedAt: this._gradedAt,
      isGraded: this.isGraded,
    };
  }
}
