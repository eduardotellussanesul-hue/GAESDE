import type { Review, ReviewStats } from '../../../domain/entities/review';
import { asNullableString, asNumber, asOptionalString, asRecord, asString } from './mapperUtils';

export function mapReview(input: unknown): Review {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    courseId: asString(item.courseId),
    userId: asString(item.userId),
    rating: asNumber(item.rating),
    comment: asNullableString(item.comment),
    createdAt: asOptionalString(item.createdAt),
    updatedAt: asOptionalString(item.updatedAt),
  };
}

export function mapReviewStats(input: unknown): ReviewStats {
  const item = asRecord(input);
  return {
    average: asNumber(item.average),
    totalReviews: asNumber(item.totalReviews),
    distribution: (item.distribution as Record<string, number>) ?? {},
  };
}