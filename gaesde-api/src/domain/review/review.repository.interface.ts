import { Review } from './review.entity';

export interface IReviewRepository {
  save(review: Review): Promise<Review>;
  findById(id: string): Promise<Review | null>;
  findByCourse(courseId: string): Promise<Review[]>;
  findByUser(userId: string): Promise<Review[]>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Review | null>;
  findAll(): Promise<Review[]>;
  update(id: string, data: Partial<Review>): Promise<Review | null>;
  delete(id: string): Promise<void>;
  getAverageRating(courseId: string): Promise<number>;
  getRatingCount(courseId: string): Promise<number>;
}
