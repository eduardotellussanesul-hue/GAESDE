import { Image } from './image.entity';

export interface IImageRepository {
  save(image: Image): Promise<Image>;
  findById(id: string): Promise<Image | null>;
  findAll(): Promise<Image[]>;
  findByUser(userId: string): Promise<Image[]>;
  delete(id: string): Promise<void>;
}
