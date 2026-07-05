import { Course, CourseStatus, CourseLevel } from './course.entity';

export interface ICourseRepository {
  save(course: Course): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findBySlug(slug: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  findPublished(): Promise<Course[]>;
  findByInstructor(instructorId: string): Promise<Course[]>;
  findByCategory(categoryId: string): Promise<Course[]>;
  findByStatus(status: CourseStatus): Promise<Course[]>;
  findByLevel(level: CourseLevel): Promise<Course[]>;
  update(id: string, data: Partial<Course>): Promise<Course | null>;
  delete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
