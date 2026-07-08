import type { Course } from '../entities/course';

export interface CourseRepository {
  listCourses(token: string): Promise<Course[]>;
  listPublishedCourses(token: string): Promise<Course[]>;
  listInstructorCourses(token: string, instructorId: string): Promise<Course[]>;
  createCourse(token: string, data: {
    title: string;
    slug: string;
    description?: string;
    price?: number;
    level: Course['level'];
    categoryId?: string | null;
    status?: Course['status'];
  }): Promise<Course>;
  updateCourse(token: string, courseId: string, data: Partial<Pick<Course, 'title' | 'slug' | 'description' | 'price' | 'level' | 'categoryId'>>): Promise<Course>;
  publishCourse(token: string, courseId: string): Promise<Course>;
  archiveCourse(token: string, courseId: string): Promise<Course>;
}