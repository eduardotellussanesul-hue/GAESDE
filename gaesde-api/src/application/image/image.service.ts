import { Injectable, Inject } from '@nestjs/common';
import type { IImageRepository } from '../../domain/image/image.repository.interface';
import { Image } from '../../domain/image/image.entity';
import { ImageNotFoundException } from '../../domain/image/image.exceptions';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';

@Injectable()
export class ImageService {
  constructor(
    @Inject('IImageRepository') private imageRepository: IImageRepository,
    private cloudinaryService: CloudinaryService,
  ) {}

  async upload(
    file: Express.Multer.File,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<Image> {
    const { url, publicId } = await this.cloudinaryService.uploadFile(file, {
      folder: `users/${userId}`,
    });
    const image = new Image(url, publicId, userId, metadata);
    return this.imageRepository.save(image);
  }

  async findAll(): Promise<Image[]> {
    return this.imageRepository.findAll();
  }

  async findByUser(userId: string): Promise<Image[]> {
    return this.imageRepository.findByUser(userId);
  }

  async findById(id: string): Promise<Image> {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw new ImageNotFoundException(id);
    }
    return image;
  }

  async delete(id: string): Promise<void> {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw new ImageNotFoundException(id);
    }
    await this.cloudinaryService.deleteFile(image.publicId);
    await this.imageRepository.delete(id);
  }
}
