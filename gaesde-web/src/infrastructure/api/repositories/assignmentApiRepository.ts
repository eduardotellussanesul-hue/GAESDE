import type { AssignmentSubmission } from '../../../domain/entities/assignmentSubmission';
import type { AssignmentRepository } from '../../../domain/repositories/assignmentRepository';
import { apiClient } from '../client';
import { mapAssignmentSubmission } from '../mappers/assignmentMapper';

export class AssignmentApiRepository implements AssignmentRepository {
  async submitAssignment(token: string, contentId: string, fileUrl: string): Promise<AssignmentSubmission> {
    const response = await apiClient.request(`/assignment-submissions/submit/${contentId}`, {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ fileUrl }),
    });
    return mapAssignmentSubmission(response);
  }

  async listMyAssignments(token: string): Promise<AssignmentSubmission[]> {
    const response = await apiClient.request<unknown[]>('/assignment-submissions/user', { method: 'GET', authToken: token });
    return response.map(mapAssignmentSubmission);
  }

  async listSubmissionsByContent(token: string, contentId: string): Promise<AssignmentSubmission[]> {
    const response = await apiClient.request<unknown[]>(`/assignment-submissions/content/${contentId}`, { method: 'GET', authToken: token });
    return response.map(mapAssignmentSubmission);
  }

  async gradeSubmission(token: string, submissionId: string, grade: number, feedback?: string): Promise<AssignmentSubmission> {
    const response = await apiClient.request(`/assignment-submissions/${submissionId}/grade`, {
      method: 'PUT',
      authToken: token,
      body: JSON.stringify({ grade, feedback }),
    });
    return mapAssignmentSubmission(response);
  }
}