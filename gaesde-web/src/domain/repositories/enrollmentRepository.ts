import type { CourseCommunity, Enrollment, ProgressSnapshot } from '../entities/enrollment';

export interface EnrollmentRepository {
  enrollSelf(token: string, courseId: string): Promise<Enrollment>;
  assignEnrollment(token: string, userId: string, courseId: string): Promise<Enrollment>;
  listMyEnrollments(token: string): Promise<Enrollment[]>;
  listCourseEnrollments(token: string, courseId: string): Promise<Enrollment[]>;
  updateEnrollmentProgress(token: string, enrollmentId: string): Promise<Enrollment>;
  completeEnrollment(token: string, enrollmentId: string): Promise<Enrollment>;
  completeContent(token: string, contentId: string): Promise<void>;
  getCourseProgress(token: string, courseId: string): Promise<ProgressSnapshot>;
  getCourseCommunity(token: string, courseId: string): Promise<CourseCommunity>;
}