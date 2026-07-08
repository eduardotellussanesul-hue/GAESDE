import type { AssignmentSubmission } from '../entities/assignmentSubmission';

export interface AssignmentRepository {
  submitAssignment(token: string, contentId: string, fileUrl: string): Promise<AssignmentSubmission>;
  listMyAssignments(token: string): Promise<AssignmentSubmission[]>;
  listSubmissionsByContent(token: string, contentId: string): Promise<AssignmentSubmission[]>;
  gradeSubmission(token: string, submissionId: string, grade: number, feedback?: string): Promise<AssignmentSubmission>;
}