export type ContentType = 'video' | 'text' | 'pdf' | 'quiz' | 'assignment';

export type ContentVideo = {
  id: string;
  contentId: string;
  videoUrl: string;
  videoDurationSeconds?: number;
  createdAt?: string;
};

export type ContentText = {
  id: string;
  contentId: string;
  body: string;
  createdAt?: string;
};

export type ContentPdf = {
  id: string;
  contentId: string;
  fileUrl: string;
  fileSizeBytes?: number;
  createdAt?: string;
};

export type ContentItem = {
  id: string;
  moduleId: string;
  title: string;
  type: ContentType;
  orderIndex: number;
  isFreePreview: boolean;
  durationSeconds?: number;
  createdAt?: string;
  updatedAt?: string;
  video?: ContentVideo | null;
  text?: ContentText | null;
  pdf?: ContentPdf | null;
};