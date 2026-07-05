import { Injectable, Inject } from '@nestjs/common';
import type { IAssignmentSubmissionRepository } from '../../domain/assignment-submission/assignment-submission.repository.interface';
import type { IContentRepository } from '../../domain/content/content.repository.interface';
import type { IEnrollmentRepository } from '../../domain/enrollment/enrollment.repository.interface';
import { AssignmentSubmission } from '../../domain/assignment-submission/assignment-submission.entity';
import { 
  AssignmentSubmissionNotFoundException,
  AssignmentAlreadySubmittedException,
} from '../../domain/assignment-submission/assignment-submission.exceptions';
import { ContentNotFoundException } from '../../domain/content/content.exceptions';
import { EnrollmentNotActiveException } from '../../domain/enrollment/enrollment.exceptions';

@Injectable()
export class AssignmentSubmissionService {
  constructor(
    @Inject('IAssignmentSubmissionRepository') private submissionRepository: IAssignmentSubmissionRepository,
    @Inject('IContentRepository') private contentRepository: IContentRepository,
    @Inject('IEnrollmentRepository') private enrollmentRepository: IEnrollmentRepository,
  ) {}

  async submit(userId: string, contentId: string, fileUrl: string): Promise<any> {
    const content = await this.contentRepository.findContentById(contentId);
    if (!content) {
      throw new ContentNotFoundException(contentId);
    }

    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, content.moduleId);
    if (!enrollment) {
      throw new Error('User is not enrolled in this course');
    }

    if (!enrollment.isActive) {
      throw new EnrollmentNotActiveException(enrollment.id);
    }

    const existing = await this.submissionRepository.findByUserAndContent(userId, contentId);
    if (existing) {
      throw new AssignmentAlreadySubmittedException(contentId, userId);
    }

    const submission = new AssignmentSubmission(contentId, userId, enrollment.id, fileUrl);
    const saved = await this.submissionRepository.save(submission);
    return saved.toJSON();
  }

  async findById(id: string): Promise<any> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw new AssignmentSubmissionNotFoundException(id);
    }
    return submission.toJSON();
  }

  async findByUser(userId: string): Promise<any[]> {
    const submissions = await this.submissionRepository.findByUser(userId);
    return submissions.map(s => s.toJSON());
  }

  async findByContent(contentId: string): Promise<any[]> {
    const submissions = await this.submissionRepository.findByContent(contentId);
    return submissions.map(s => s.toJSON());
  }

  async gradeSubmission(id: string, grade: number, feedback?: string): Promise<any> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw new AssignmentSubmissionNotFoundException(id);
    }

    submission.assignGrade(grade, feedback); // Usando assignGrade em vez de grade
    const updated = await this.submissionRepository.update(id, submission);
    return updated.toJSON();
  }

  async delete(id: string): Promise<void> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw new AssignmentSubmissionNotFoundException(id);
    }
    await this.submissionRepository.delete(id);
  }
}
