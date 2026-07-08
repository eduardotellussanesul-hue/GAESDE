import type { Category } from '../../../domain/entities/category';
import type { ContentItem, ContentPdf, ContentText, ContentType, ContentVideo } from '../../../domain/entities/content';
import type { Course } from '../../../domain/entities/course';
import type { ModuleItem } from '../../../domain/entities/moduleItem';
import { asBoolean, asNullableString, asNumber, asOptionalString, asRecord, asString } from './mapperUtils';

export function mapCategory(input: unknown): Category {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    name: asString(item.name),
    slug: asString(item.slug),
    parentId: asNullableString(item.parentId),
    createdAt: asOptionalString(item.createdAt),
  };
}

export function mapCourse(input: unknown): Course {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    title: asString(item.title),
    slug: asString(item.slug),
    description: asNullableString(item.description),
    coverImage: asNullableString(item.coverImage),
    price: typeof item.price === 'number' ? item.price : 0,
    status: asString(item.status, 'draft') as Course['status'],
    level: asString(item.level, 'beginner') as Course['level'],
    instructorId: asString(item.instructorId),
    categoryId: asNullableString(item.categoryId),
    publishedAt: asNullableString(item.publishedAt),
    createdAt: asOptionalString(item.createdAt),
    updatedAt: asOptionalString(item.updatedAt),
    deletedAt: asNullableString(item.deletedAt),
  };
}

export function mapModule(input: unknown): ModuleItem {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    courseId: asString(item.courseId),
    title: asString(item.title),
    description: asNullableString(item.description),
    orderIndex: asNumber(item.orderIndex),
    createdAt: asOptionalString(item.createdAt),
    updatedAt: asOptionalString(item.updatedAt),
  };
}

export function mapVideo(input: unknown): ContentVideo {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    contentId: asString(item.contentId),
    videoUrl: asString(item.videoUrl),
    videoDurationSeconds: typeof item.videoDurationSeconds === 'number' ? item.videoDurationSeconds : undefined,
    createdAt: asOptionalString(item.createdAt),
  };
}

export function mapText(input: unknown): ContentText {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    contentId: asString(item.contentId),
    body: asString(item.body),
    createdAt: asOptionalString(item.createdAt),
  };
}

export function mapPdf(input: unknown): ContentPdf {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    contentId: asString(item.contentId),
    fileUrl: asString(item.fileUrl),
    fileSizeBytes: typeof item.fileSizeBytes === 'number' ? item.fileSizeBytes : undefined,
    createdAt: asOptionalString(item.createdAt),
  };
}

export function mapContent(input: unknown): ContentItem {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    moduleId: asString(item.moduleId),
    title: asString(item.title),
    type: asString(item.type) as ContentType,
    orderIndex: asNumber(item.orderIndex),
    isFreePreview: asBoolean(item.isFreePreview),
    durationSeconds: typeof item.durationSeconds === 'number' ? item.durationSeconds : undefined,
    createdAt: asOptionalString(item.createdAt),
    updatedAt: asOptionalString(item.updatedAt),
    video: item.video ? mapVideo(item.video) : null,
    text: item.text ? mapText(item.text) : null,
    pdf: item.pdf ? mapPdf(item.pdf) : null,
  };
}