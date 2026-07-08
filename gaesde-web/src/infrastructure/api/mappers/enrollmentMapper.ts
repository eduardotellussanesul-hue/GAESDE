import type { CourseCommunity, CourseCommunityMember, Enrollment, ProgressSnapshot } from '../../../domain/entities/enrollment';
import { asBoolean, asNullableString, asNumber, asOptionalString, asRecord, asString } from './mapperUtils';

export function mapEnrollment(input: unknown): Enrollment {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    userId: asString(item.userId),
    courseId: asString(item.courseId),
    status: asString(item.status, 'active') as Enrollment['status'],
    progressPercentage: asNumber(item.progressPercentage),
    enrolledAt: asOptionalString(item.enrolledAt),
    expiresAt: asNullableString(item.expiresAt),
    lastAccessedAt: asNullableString(item.lastAccessedAt),
    isActive: asBoolean(item.isActive),
    isCompleted: asBoolean(item.isCompleted),
    isExpired: asBoolean(item.isExpired),
    course: item.course ? {
      id: asString(asRecord(item.course).id),
      title: asString(asRecord(item.course).title),
      slug: asString(asRecord(item.course).slug),
      coverImage: asNullableString(asRecord(item.course).coverImage),
      level: asOptionalString(asRecord(item.course).level) as Enrollment['course'] extends infer T ? T extends { level?: infer L } ? L : never : never,
      status: asOptionalString(asRecord(item.course).status) as Enrollment['course'] extends infer T ? T extends { status?: infer S } ? S : never : never,
    } : null,
    user: item.user ? {
      id: asString(asRecord(item.user).id),
      name: asString(asRecord(item.user).name),
      email: asString(asRecord(item.user).email),
      avatarUrl: asNullableString(asRecord(item.user).avatarUrl),
    } : null,
  };
}

export function mapProgress(input: unknown): ProgressSnapshot {
  const item = asRecord(input);
  return {
    totalContents: asNumber(item.totalContents),
    completedContents: asNumber(item.completedContents),
    progressPercentage: asNumber(item.progressPercentage),
    completedContentIds: Array.isArray(item.completedContentIds)
      ? item.completedContentIds.map((value) => asString(value))
      : [],
  };
}

function mapCommunityMember(input: unknown): CourseCommunityMember {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    name: asString(item.name),
    email: asString(item.email),
    avatarUrl: asNullableString(item.avatarUrl),
    enrollmentStatus: asOptionalString(item.enrollmentStatus) as Enrollment['status'] | undefined,
    progressPercentage: typeof item.progressPercentage === 'number' ? item.progressPercentage : undefined,
  };
}

export function mapCourseCommunity(input: unknown): CourseCommunity {
  const item = asRecord(input);
  const course = asRecord(item.course);

  return {
    course: {
      id: asString(course.id),
      title: asString(course.title),
      slug: asString(course.slug),
      level: asOptionalString(course.level),
    },
    instructor: item.instructor ? mapCommunityMember(item.instructor) : null,
    students: Array.isArray(item.students) ? item.students.map(mapCommunityMember) : [],
    totalStudents: asNumber(item.totalStudents),
  };
}