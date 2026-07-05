import { Injectable, Inject } from '@nestjs/common';
import type { IContentCompletionRepository } from '../../domain/content-completion/content-completion.repository.interface';
import type { IContentRepository } from '../../domain/content/content.repository.interface';
import type { IEnrollmentRepository } from '../../domain/enrollment/enrollment.repository.interface';
import { ContentCompletion } from '../../domain/content-completion/content-completion.entity';
import { 
  ContentCompletionNotFoundException, 
  ContentAlreadyCompletedException,
} from '../../domain/content-completion/content-completion.exceptions';
import { ContentNotFoundException } from '../../domain/content/content.exceptions';
import { EnrollmentNotActiveException } from '../../domain/enrollment/enrollment.exceptions';

@Injectable()
export class ContentCompletionService {
  constructor(
    @Inject('IContentCompletionRepository') private completionRepository: IContentCompletionRepository,
    @Inject('IContentRepository') private contentRepository: IContentRepository,
    @Inject('IEnrollmentRepository') private enrollmentRepository: IEnrollmentRepository,
  ) {}

  async complete(userId: string, contentId: string): Promise<any> {
    const content = await this.contentRepository.findContentById(contentId);
    if (!content) {
      throw new ContentNotFoundException(contentId);
    }

    const existing = await this.completionRepository.findByUserAndContent(userId, contentId);
    if (existing) {
      throw new ContentAlreadyCompletedException(userId, contentId);
    }

    const moduleModel = this.completionRepository['completionModel'].db.model('Module');
    const module = await moduleModel.findById(content.moduleId).exec();
    if (!module) {
      throw new Error('Module not found');
    }

    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, module.course_id);
    if (!enrollment) {
      throw new Error('User is not enrolled in this course');
    }

    if (!enrollment.isActive) {
      throw new EnrollmentNotActiveException(enrollment.id);
    }

    const completion = new ContentCompletion(userId, contentId);
    const saved = await this.completionRepository.save(completion);

    return {
      ...saved.toJSON(),
      progressUpdated: true,
    };
  }

  async findById(id: string): Promise<any> {
    const completion = await this.completionRepository.findById(id);
    if (!completion) {
      throw new ContentCompletionNotFoundException(id);
    }
    return completion.toJSON();
  }

  async findByUser(userId: string): Promise<any[]> {
    const completions = await this.completionRepository.findByUser(userId);
    return completions.map(c => c.toJSON());
  }

  async findByContent(contentId: string): Promise<any[]> {
    const completions = await this.completionRepository.findByContent(contentId);
    return completions.map(c => c.toJSON());
  }

  async findByUserAndContent(userId: string, contentId: string): Promise<any> {
    const completion = await this.completionRepository.findByUserAndContent(userId, contentId);
    if (!completion) {
      return null;
    }
    return completion.toJSON();
  }

  async getProgress(userId: string, courseId: string): Promise<any> {
    const moduleModel = this.completionRepository['completionModel'].db.model('Module');
    const modules = await moduleModel.find({ course_id: courseId }).exec();
    
    let totalContents = 0;
    let completedContents = 0;
    let completedContentIds: string[] = [];

    for (const module of modules) {
      const contents = await this.contentRepository.findContentsByModule(module._id.toString());
      totalContents += contents.length;
      
      for (const content of contents) {
        const completion = await this.completionRepository.findByUserAndContent(userId, content.id);
        if (completion) {
          completedContents++;
          completedContentIds.push(content.id);
        }
      }
    }

    const progressPercentage = totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;

    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (enrollment) {
      enrollment.progressPercentage = progressPercentage;
      await this.enrollmentRepository.update(enrollment.id, enrollment);
    }

    return {
      totalContents,
      completedContents,
      progressPercentage,
      completedContentIds,
    };
  }

  async uncomplete(userId: string, contentId: string): Promise<void> {
    const completion = await this.completionRepository.findByUserAndContent(userId, contentId);
    if (!completion) {
      throw new ContentCompletionNotFoundException(`Content ${contentId} not completed by user ${userId}`);
    }
    await this.completionRepository.delete(completion.id);
  }

  async delete(id: string): Promise<void> {
    const completion = await this.completionRepository.findById(id);
    if (!completion) {
      throw new ContentCompletionNotFoundException(id);
    }
    await this.completionRepository.delete(id);
  }
}
