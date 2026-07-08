export type Certificate = {
  id: string;
  enrollmentId: string;
  userId: string;
  certificateUrl: string;
  verificationCode: string;
  issuedAt?: string;
};