import { Injectable, Inject } from '@nestjs/common';
import type { IEnrollmentRepository } from '../../domain/enrollment/enrollment.repository.interface';
import type { ICourseRepository } from '../../domain/course/course.repository.interface';
import type { IContentRepository } from '../../domain/content/content.repository.interface';
import { Enrollment, EnrollmentStatus } from '../../domain/enrollment/enrollment.entity';
import { 
  EnrollmentNotFoundException, 
  EnrollmentAlreadyExistsException,
  EnrollmentNotActiveException,
} from '../../domain/enrollment/enrollment.exceptions';
import { CourseNotFoundException } from '../../domain/course/course.exceptions';

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject('IEnrollmentRepository') private enrollmentRepository: IEnrollmentRepository,
    @Inject('ICourseRepository') private courseRepository: ICourseRepository,
    @Inject('IContentRepository') private contentRepository: IContentRepository,
  ) {}

  async enroll(userId: string, courseId: string): Promise<any> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundException(courseId);
    }

    const existing = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (existing) {
      throw new EnrollmentAlreadyExistsException(userId, courseId);
    }

    const enrollment = new Enrollment(userId, courseId, EnrollmentStatus.ACTIVE);
    const saved = await this.enrollmentRepository.save(enrollment);
    return this.mapToResponse(saved);
  }

  async findById(id: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(id);
    }
    return this.mapToResponse(enrollment);
  }

  async findByUser(userId: string): Promise<any[]> {
    const enrollments = await this.enrollmentRepository.findByUser(userId);
    return enrollments.map(e => this.mapToResponse(e));
  }

  async findByCourse(courseId: string): Promise<any[]> {
    const enrollments = await this.enrollmentRepository.findByCourse(courseId);
    return enrollments.map(e => this.mapToResponse(e));
  }

  async getMyEnrollments(userId: string): Promise<any[]> {
    const enrollments = await this.enrollmentRepository.findByUser(userId);
    return Promise.all(enrollments.map(async (e) => {
      const course = await this.courseRepository.findById(e.courseId);
      return {
        ...this.mapToResponse(e),
        course: course ? {
          id: course.id,
          title: course.title,
          slug: course.slug,
          coverImage: course.coverImage,
          level: course.level,
        } : null,
      };
    }));
  }

  async updateProgress(enrollmentId: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(enrollmentId);
    }

    if (!enrollment.isActive && !enrollment.isCompleted) {
      throw new EnrollmentNotActiveException(enrollmentId);
    }

    // Se já estiver concluído, retornar o estado atual
    if (enrollment.isCompleted) {
      return {
        ...this.mapToResponse(enrollment),
        message: 'Course already completed',
        totalContents: 0,
        completedContents: 0,
      };
    }

    const moduleModel = this.enrollmentRepository['enrollmentModel'].db.model('Module');
    const modules = await moduleModel.find({ course_id: enrollment.courseId }).exec();
    
    const completionModel = this.enrollmentRepository['enrollmentModel'].db.model('ContentCompletion');
    
    let totalContents = 0;
    let completedContents = 0;

    for (const module of modules) {
      const contents = await this.contentRepository.findContentsByModule(module._id.toString());
      totalContents += contents.length;
      
      for (const content of contents) {
        const completion = await completionModel.findOne({
          user_id: enrollment.userId,
          content_id: content.id,
        });
        if (completion) {
          completedContents++;
        }
      }
    }

    const progress = totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;
    
    enrollment.progressPercentage = progress;
    await this.enrollmentRepository.update(enrollmentId, enrollment);

    return {
      ...this.mapToResponse(enrollment),
      totalContents,
      completedContents,
    };
  }

  async updateStatus(id: string, status: EnrollmentStatus): Promise<any> {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(id);
    }

    enrollment.status = status;
    const updated = await this.enrollmentRepository.update(id, enrollment);
    return this.mapToResponse(updated);
  }

  async drop(id: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(id);
    }
    enrollment.drop();
    const updated = await this.enrollmentRepository.update(id, enrollment);
    return this.mapToResponse(updated);
  }

  async complete(id: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(id);
    }
    
    // Se já estiver concluído, apenas retornar
    if (enrollment.isCompleted) {
      return {
        ...this.mapToResponse(enrollment),
        message: 'Enrollment already completed',
      };
    }
    
    enrollment.complete();
    const updated = await this.enrollmentRepository.update(id, enrollment);
    return this.mapToResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(id);
    }
    await this.enrollmentRepository.delete(id);
  }

  private mapToResponse(enrollment: Enrollment): any {
    return enrollment.toJSON();
  }
}
