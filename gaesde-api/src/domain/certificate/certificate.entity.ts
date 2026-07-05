export class Certificate {
  private _id: string;
  private _enrollmentId: string;
  private _userId: string;
  private _certificateUrl: string;
  private _verificationCode: string;
  private _issuedAt: Date;

  constructor(
    enrollmentId: string,
    userId: string,
    certificateUrl: string,
    verificationCode: string,
  ) {
    this.validateEnrollmentId(enrollmentId);
    this.validateUserId(userId);
    this.validateCertificateUrl(certificateUrl);
    this.validateVerificationCode(verificationCode);
    
    this._enrollmentId = enrollmentId;
    this._userId = userId;
    this._certificateUrl = certificateUrl;
    this._verificationCode = verificationCode;
    this._issuedAt = new Date();
  }

  private validateEnrollmentId(enrollmentId: string): void {
    if (!enrollmentId || enrollmentId.trim().length < 1) {
      throw new Error('Enrollment ID is required');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length < 1) {
      throw new Error('User ID is required');
    }
  }

  private validateCertificateUrl(url: string): void {
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid certificate URL');
    }
  }

  private validateVerificationCode(code: string): void {
    if (!code || code.trim().length < 1) {
      throw new Error('Verification code is required');
    }
  }

  get id(): string { return this._id; }
  get enrollmentId(): string { return this._enrollmentId; }
  get userId(): string { return this._userId; }
  get certificateUrl(): string { return this._certificateUrl; }
  get verificationCode(): string { return this._verificationCode; }
  get issuedAt(): Date { return this._issuedAt; }

  set id(id: string) { this._id = id; }

  toJSON() {
    return {
      id: this._id,
      enrollmentId: this._enrollmentId,
      userId: this._userId,
      certificateUrl: this._certificateUrl,
      verificationCode: this._verificationCode,
      issuedAt: this._issuedAt,
    };
  }
}
