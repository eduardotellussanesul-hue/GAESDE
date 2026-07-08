export type ModuleItem = {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
};