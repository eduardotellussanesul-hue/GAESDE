import type { CourseSummary } from './course';

export type EnrollmentStatus = 'pending_payment' | 'active' | 'dropped' | 'completed';

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  enrolledAt?: string;
  expiresAt?: string | null;
  lastAccessedAt?: string | null;
  isActive: boolean;
  isCompleted: boolean;
  isExpired: boolean;
  course?: CourseSummary | null;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
};

export type ProgressSnapshot = {
  totalContents: number;
  completedContents: number;
  progressPercentage: number;
  completedContentIds: string[];
};

export type CourseCommunityMember = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  enrollmentStatus?: EnrollmentStatus;
  progressPercentage?: number;
};

export type CourseCommunity = {
  course: {
    id: string;
    title: string;
    slug: string;
    level?: string;
  };
  instructor: CourseCommunityMember | null;
  students: CourseCommunityMember[];
  totalStudents: number;
};