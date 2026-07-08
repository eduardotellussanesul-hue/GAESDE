export type CourseStatus = 'draft' | 'review' | 'published' | 'archived';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export type Course = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  price?: number;
  status?: CourseStatus;
  level: CourseLevel;
  instructorId: string;
  categoryId?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type CourseSummary = {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
  level?: CourseLevel;
  status?: CourseStatus;
};