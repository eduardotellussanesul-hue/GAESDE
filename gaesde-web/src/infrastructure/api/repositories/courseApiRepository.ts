import type { Course } from '../../../domain/entities/course';
import type { CourseRepository } from '../../../domain/repositories/courseRepository';
import { apiClient } from '../client';
import { mapCourse } from '../mappers/catalogMapper';

export class CourseApiRepository implements CourseRepository {
  async listCourses(token: string): Promise<Course[]> {
    const response = await apiClient.request<unknown[]>('/courses', { method: 'GET', authToken: token });
    return response.map(mapCourse);
  }

  async listPublishedCourses(token: string): Promise<Course[]> {
    const response = await apiClient.request<unknown[]>('/courses/published', { method: 'GET', authToken: token });
    return response.map(mapCourse);
  }

  async listInstructorCourses(token: string, instructorId: string): Promise<Course[]> {
    const response = await apiClient.request<unknown[]>(`/courses/instructor/${instructorId}`, { method: 'GET', authToken: token });
    return response.map(mapCourse);
  }

  async createCourse(token: string, data: {
    title: string;
    slug: string;
    description?: string;
    price?: number;
    level: Course['level'];
    categoryId?: string | null;
    status?: Course['status'];
  }): Promise<Course> {
    const response = await apiClient.request('/courses', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapCourse(response);
  }

  async updateCourse(token: string, courseId: string, data: Partial<Pick<Course, 'title' | 'slug' | 'description' | 'price' | 'level' | 'categoryId'>>): Promise<Course> {
    const response = await apiClient.request(`/courses/${courseId}`, {
      method: 'PUT',
      authToken: token,
      body: JSON.stringify(data),
    });
    return mapCourse(response);
  }

  async publishCourse(token: string, courseId: string): Promise<Course> {
    const response = await apiClient.request(`/courses/${courseId}/publish`, { method: 'POST', authToken: token });
    return mapCourse(response);
  }

  async archiveCourse(token: string, courseId: string): Promise<Course> {
    const response = await apiClient.request(`/courses/${courseId}/archive`, { method: 'POST', authToken: token });
    return mapCourse(response);
  }
}