export type Review = {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ReviewStats = {
  average: number;
  totalReviews: number;
  distribution: Record<string, number>;
};