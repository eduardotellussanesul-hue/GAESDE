import type { AssignmentSubmission } from '../../../domain/entities/assignmentSubmission';
import { asNullableString, asOptionalString, asRecord, asString } from './mapperUtils';

export function mapAssignmentSubmission(input: unknown): AssignmentSubmission {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    contentId: asString(item.contentId),
    userId: asString(item.userId),
    enrollmentId: asString(item.enrollmentId),
    fileUrl: asString(item.fileUrl),
    submittedAt: asOptionalString(item.submittedAt),
    grade: typeof item.grade === 'number' ? item.grade : null,
    instructorFeedback: asNullableString(item.instructorFeedback),
    gradedAt: asNullableString(item.gradedAt),
  };
}