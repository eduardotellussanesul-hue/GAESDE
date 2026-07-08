export type AssignmentSubmission = {
  id: string;
  contentId: string;
  userId: string;
  enrollmentId: string;
  fileUrl: string;
  submittedAt?: string;
  grade?: number | null;
  instructorFeedback?: string | null;
  gradedAt?: string | null;
};