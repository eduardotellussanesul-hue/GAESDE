import type { Review, ReviewStats } from '../entities/review';

export interface ReviewRepository {
  createReview(token: string, courseId: string, rating: number, comment?: string): Promise<Review>;
  listCourseReviews(token: string, courseId: string): Promise<Review[]>;
  getCourseReviewStats(token: string, courseId: string): Promise<ReviewStats>;
}