import type { Review, ReviewStats } from '../../../domain/entities/review';
import type { ReviewRepository } from '../../../domain/repositories/reviewRepository';
import { apiClient } from '../client';
import { mapReview, mapReviewStats } from '../mappers/reviewMapper';

export class ReviewApiRepository implements ReviewRepository {
  async createReview(token: string, courseId: string, rating: number, comment?: string): Promise<Review> {
    const response = await apiClient.request('/reviews', {
      method: 'POST',
      authToken: token,
      body: JSON.stringify({ courseId, rating, comment }),
    });
    return mapReview(response);
  }

  async listCourseReviews(token: string, courseId: string): Promise<Review[]> {
    const response = await apiClient.request<unknown[]>(`/reviews/course/${courseId}`, { method: 'GET', authToken: token });
    return response.map(mapReview);
  }

  async getCourseReviewStats(token: string, courseId: string): Promise<ReviewStats> {
    const response = await apiClient.request(`/reviews/course/${courseId}/stats`, { method: 'GET', authToken: token });
    return mapReviewStats(response);
  }
}