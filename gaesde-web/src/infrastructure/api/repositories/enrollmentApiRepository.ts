import type { CourseCommunity, Enrollment, ProgressSnapshot } from '../../../domain/entities/enrollment';
import type { EnrollmentRepository } from '../../../domain/repositories/enrollmentRepository';
import { apiClient } from '../client';
import { mapCourseCommunity, mapEnrollment, mapProgress } from '../mappers/enrollmentMapper';

export class EnrollmentApiRepository implements EnrollmentRepository {
  async enrollSelf(token: string, courseId: string): Promise<Enrollment> {
    const response = await apiClient.request('/enrollments', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ courseId }),
    });
    return mapEnrollment(response);
  }

  async assignEnrollment(token: string, userId: string, courseId: string): Promise<Enrollment> {
    const response = await apiClient.request('/enrollments/assign', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ userId, courseId }),
    });
    return mapEnrollment(response);
  }

  async listMyEnrollments(token: string): Promise<Enrollment[]> {
    const response = await apiClient.request<unknown[]>('/enrollments/my-enrollments', { method: 'GET', authToken: token });
    return response.map(mapEnrollment);
  }

  async listCourseEnrollments(token: string, courseId: string): Promise<Enrollment[]> {
    const response = await apiClient.request<unknown[]>(`/enrollments/course/${courseId}`, { method: 'GET', authToken: token });
    return response.map(mapEnrollment);
  }

  async updateEnrollmentProgress(token: string, enrollmentId: string): Promise<Enrollment> {
    const response = await apiClient.request(`/enrollments/${enrollmentId}/progress`, { method: 'POST', authToken: token });
    return mapEnrollment(response);
  }

  async completeEnrollment(token: string, enrollmentId: string): Promise<Enrollment> {
    const response = await apiClient.request(`/enrollments/${enrollmentId}/complete`, { method: 'POST', authToken: token });
    return mapEnrollment(response);
  }

  async completeContent(token: string, contentId: string): Promise<void> {
    await apiClient.request('/completions', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ contentId }),
    });
  }

  async getCourseProgress(token: string, courseId: string): Promise<ProgressSnapshot> {
    const response = await apiClient.request(`/completions/progress/${courseId}`, { method: 'GET', authToken: token });
    return mapProgress(response);
  }

  async getCourseCommunity(token: string, courseId: string): Promise<CourseCommunity> {
    const response = await apiClient.request(`/enrollments/course/${courseId}/community`, { method: 'GET', authToken: token });
    return mapCourseCommunity(response);
  }
}