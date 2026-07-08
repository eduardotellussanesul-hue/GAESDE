import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type { IEnrollmentRepository } from '../../domain/enrollment/enrollment.repository.interface';
import type { ICourseRepository } from '../../domain/course/course.repository.interface';
import type { IContentRepository } from '../../domain/content/content.repository.interface';
import type { IUserRepository } from '../../domain/user/user.repository.interface';
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
    @Inject('IUserRepository') private userRepository: IUserRepository,
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

    const [course, user] = await Promise.all([
      this.courseRepository.findById(enrollment.courseId),
      this.userRepository.findById(enrollment.userId),
    ]);

    return this.mapWithRelations(enrollment, course, user);
  }

  async findByUser(userId: string): Promise<any[]> {
    const enrollments = await this.enrollmentRepository.findByUser(userId);
    return Promise.all(enrollments.map(async (e) => {
      const course = await this.courseRepository.findById(e.courseId);
      return this.mapWithRelations(e, course, null);
    }));
  }

  async findByCourse(courseId: string): Promise<any[]> {
    const enrollments = await this.enrollmentRepository.findByCourse(courseId);
    const course = await this.courseRepository.findById(courseId);

    return Promise.all(enrollments.map(async (e) => {
      const user = await this.userRepository.findById(e.userId);
      return this.mapWithRelations(e, course, user);
    }));
  }

  async getCourseCommunity(requestUserId: string, courseId: string, canManageClassroom: boolean): Promise<any> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundException(courseId);
    }

    if (!canManageClassroom) {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(requestUserId, courseId);
      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled in this course');
      }
    }

    const [instructor, enrollments] = await Promise.all([
      this.userRepository.findById(course.instructorId),
      this.enrollmentRepository.findByCourse(courseId),
    ]);

    const students = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await this.userRepository.findById(enrollment.userId);
        if (!user || user.id === course.instructorId) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl || null,
          enrollmentStatus: enrollment.status,
          progressPercentage: enrollment.progressPercentage,
        };
      }),
    );

    const filteredStudents = students.filter((student): student is NonNullable<typeof student> => Boolean(student));

    return {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        level: course.level,
      },
      instructor: instructor
        ? {
            id: instructor.id,
            name: instructor.name,
            email: instructor.email,
            avatarUrl: instructor.avatarUrl || null,
          }
        : null,
      students: filteredStudents,
      totalStudents: filteredStudents.length,
    };
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

  async resetMyCourseProgress(userId: string, courseId: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(`Enrollment for user ${userId} and course ${courseId} not found`);
    }

    const db = this.enrollmentRepository['enrollmentModel'].db;
    const moduleModel = db.model('Module');
    const contentModel = db.model('Content');
    const completionModel = db.model('ContentCompletion');
    const quizModel = db.model('Quiz');
    const quizAttemptModel = db.model('QuizAttempt');
    const userAnswerModel = db.model('UserAnswer');
    const assignmentSubmissionModel = db.model('AssignmentSubmission');

    const modules = await moduleModel.find({ course_id: courseId }).select('_id').exec();
    const moduleIds = modules.map((module: any) => module._id.toString());

    const contents = moduleIds.length > 0
      ? await contentModel.find({ module_id: { $in: moduleIds } }).select('_id').exec()
      : [];
    const contentIds = contents.map((content: any) => content._id.toString());

    const quizDocs = contentIds.length > 0
      ? await quizModel.find({ content_id: { $in: contentIds } }).select('_id').exec()
      : [];
    const quizIds = quizDocs.map((quiz: any) => quiz._id.toString());

    const attempts = quizIds.length > 0
      ? await quizAttemptModel.find({ user_id: userId, quiz_id: { $in: quizIds } }).select('_id').exec()
      : [];
    const attemptIds = attempts.map((attempt: any) => attempt._id.toString());

    const [completionDeleteResult, answerDeleteResult, attemptDeleteResult, assignmentDeleteResult] = await Promise.all([
      contentIds.length > 0
        ? completionModel.deleteMany({ user_id: userId, content_id: { $in: contentIds } }).exec()
        : Promise.resolve({ deletedCount: 0 }),
      attemptIds.length > 0
        ? userAnswerModel.deleteMany({ attempt_id: { $in: attemptIds } }).exec()
        : Promise.resolve({ deletedCount: 0 }),
      attemptIds.length > 0
        ? quizAttemptModel.deleteMany({ _id: { $in: attemptIds } }).exec()
        : Promise.resolve({ deletedCount: 0 }),
      contentIds.length > 0
        ? assignmentSubmissionModel.deleteMany({ user_id: userId, content_id: { $in: contentIds } }).exec()
        : Promise.resolve({ deletedCount: 0 }),
    ]);

    enrollment.status = EnrollmentStatus.ACTIVE;
    enrollment.progressPercentage = 0;
    const updatedEnrollment = await this.enrollmentRepository.update(enrollment.id, enrollment);
    if (!updatedEnrollment) {
      throw new EnrollmentNotFoundException(enrollment.id);
    }

    return {
      enrollment: this.mapToResponse(updatedEnrollment),
      reset: {
        deletedCompletions: completionDeleteResult.deletedCount ?? 0,
        deletedUserAnswers: answerDeleteResult.deletedCount ?? 0,
        deletedQuizAttempts: attemptDeleteResult.deletedCount ?? 0,
        deletedAssignmentSubmissions: assignmentDeleteResult.deletedCount ?? 0,
      },
      message: 'Course progress reset successfully',
    };
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

  private mapWithRelations(enrollment: Enrollment, course: any, user: any): any {
    return {
      ...this.mapToResponse(enrollment),
      course: course ? {
        id: course.id,
        title: course.title,
        slug: course.slug,
        coverImage: course.coverImage,
        level: course.level,
        status: course.status,
      } : null,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || null,
      } : null,
    };
  }
}
