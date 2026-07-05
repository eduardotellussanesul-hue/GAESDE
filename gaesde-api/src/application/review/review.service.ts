import { Injectable, Inject } from '@nestjs/common';
import type { IReviewRepository } from '../../domain/review/review.repository.interface';
import type { ICourseRepository } from '../../domain/course/course.repository.interface';
import type { IEnrollmentRepository } from '../../domain/enrollment/enrollment.repository.interface';
import { Review } from '../../domain/review/review.entity';
import { 
  ReviewNotFoundException, 
  ReviewAlreadyExistsException,
} from '../../domain/review/review.exceptions';
import { CourseNotFoundException } from '../../domain/course/course.exceptions';

@Injectable()
export class ReviewService {
  constructor(
    @Inject('IReviewRepository') private reviewRepository: IReviewRepository,
    @Inject('ICourseRepository') private courseRepository: ICourseRepository,
    @Inject('IEnrollmentRepository') private enrollmentRepository: IEnrollmentRepository,
  ) {}

  async create(userId: string, courseId: string, rating: number, comment?: string): Promise<any> {
    // Verificar se curso existe
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundException(courseId);
    }

    // Verificar se usuário está matriculado
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (!enrollment) {
      throw new Error('User is not enrolled in this course');
    }

    // Verificar se já avaliou
    const existing = await this.reviewRepository.findByUserAndCourse(userId, courseId);
    if (existing) {
      throw new ReviewAlreadyExistsException(userId, courseId);
    }

    const review = new Review(courseId, userId, rating, comment);
    const saved = await this.reviewRepository.save(review);
    return this.mapToResponse(saved);
  }

  async findById(id: string): Promise<any> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new ReviewNotFoundException(id);
    }
    return this.mapToResponse(review);
  }

  async findByCourse(courseId: string): Promise<any[]> {
    const reviews = await this.reviewRepository.findByCourse(courseId);
    return reviews.map(r => this.mapToResponse(r));
  }

  async findByUser(userId: string): Promise<any[]> {
    const reviews = await this.reviewRepository.findByUser(userId);
    return reviews.map(r => this.mapToResponse(r));
  }

  async update(id: string, data: { rating?: number; comment?: string }): Promise<any> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new ReviewNotFoundException(id);
    }

    if (data.rating !== undefined) review.rating = data.rating;
    if (data.comment !== undefined) review.comment = data.comment;

    const updated = await this.reviewRepository.update(id, review);
    if (!updated) {
      throw new ReviewNotFoundException(id);
    }
    return this.mapToResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new ReviewNotFoundException(id);
    }
    await this.reviewRepository.delete(id);
  }

  async getCourseStats(courseId: string): Promise<any> {
    const average = await this.reviewRepository.getAverageRating(courseId);
    const count = await this.reviewRepository.getRatingCount(courseId);
    
    // Distribuição de ratings
    const reviews = await this.reviewRepository.findByCourse(courseId);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    return {
      average,
      totalReviews: count,
      distribution,
    };
  }

  private mapToResponse(review: Review): any {
    return review.toJSON();
  }
}
