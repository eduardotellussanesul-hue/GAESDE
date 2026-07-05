import { Enrollment, EnrollmentStatus } from './enrollment.entity';

export interface IEnrollmentRepository {
  save(enrollment: Enrollment): Promise<Enrollment>;
  findById(id: string): Promise<Enrollment | null>;
  findByUser(userId: string): Promise<Enrollment[]>;
  findByCourse(courseId: string): Promise<Enrollment[]>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null>;
  findByStatus(status: EnrollmentStatus): Promise<Enrollment[]>;
  findActive(): Promise<Enrollment[]>;
  findExpired(): Promise<Enrollment[]>;
  findAll(): Promise<Enrollment[]>;
  update(id: string, data: Partial<Enrollment>): Promise<Enrollment | null>;
  delete(id: string): Promise<void>;
}
