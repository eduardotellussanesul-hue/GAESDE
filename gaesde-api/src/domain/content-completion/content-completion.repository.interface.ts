import { ContentCompletion } from './content-completion.entity';

export interface IContentCompletionRepository {
  save(completion: ContentCompletion): Promise<ContentCompletion>;
  findById(id: string): Promise<ContentCompletion | null>;
  findByUser(userId: string): Promise<ContentCompletion[]>;
  findByContent(contentId: string): Promise<ContentCompletion[]>;
  findByUserAndContent(userId: string, contentId: string): Promise<ContentCompletion | null>;
  findByUserAndModule(userId: string, moduleId: string): Promise<ContentCompletion[]>;
  findAll(): Promise<ContentCompletion[]>;
  delete(id: string): Promise<void>;
  deleteByUserAndContent(userId: string, contentId: string): Promise<void>;
}
