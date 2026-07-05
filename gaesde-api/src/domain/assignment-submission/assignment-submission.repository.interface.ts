import { AssignmentSubmission } from './assignment-submission.entity';

export interface IAssignmentSubmissionRepository {
  save(submission: AssignmentSubmission): Promise<AssignmentSubmission>;
  findById(id: string): Promise<AssignmentSubmission | null>;
  findByUser(userId: string): Promise<AssignmentSubmission[]>;
  findByContent(contentId: string): Promise<AssignmentSubmission[]>;
  findByEnrollment(enrollmentId: string): Promise<AssignmentSubmission[]>;
  findByUserAndContent(userId: string, contentId: string): Promise<AssignmentSubmission | null>;
  findAll(): Promise<AssignmentSubmission[]>;
  update(id: string, data: Partial<AssignmentSubmission>): Promise<AssignmentSubmission | null>;
  delete(id: string): Promise<void>;
}
