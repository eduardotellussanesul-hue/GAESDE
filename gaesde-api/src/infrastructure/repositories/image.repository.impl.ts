import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Image } from '../../domain/image/image.entity';
import { IImageRepository } from '../../domain/image/image.repository.interface';

export interface ImageDocument extends Document {
  url: string;
  publicId: string;
  userId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export const ImageSchema = new Schema<ImageDocument>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    userId: { type: String, required: true },
    metadata: { type: Object, required: false },
  },
  { timestamps: true },
);

@Injectable()
export class ImageRepository implements IImageRepository {
  constructor(@InjectModel('Image') private imageModel: Model<ImageDocument>) {}

  async save(image: Image): Promise<Image> {
    const newImage = new this.imageModel({
      url: image.url,
      publicId: image.publicId,
      userId: image.userId,
      metadata: image.metadata,
    });
    const saved = await newImage.save();
    image.id = saved._id.toString();
    return image;
  }

  async findById(id: string): Promise<Image | null> {
    const found = await this.imageModel.findById(id).exec();
    if (!found) return null;
    const image = new Image(found.url, found.publicId, found.userId, found.metadata);
    image.id = found._id.toString();
    return image;
  }

  async findAll(): Promise<Image[]> {
    const found = await this.imageModel.find().exec();
    return found.map((f) => {
      const image = new Image(f.url, f.publicId, f.userId, f.metadata);
      image.id = f._id.toString();
      return image;
    });
  }

  async findByUser(userId: string): Promise<Image[]> {
    const found = await this.imageModel.find({ userId }).exec();
    return found.map((f) => {
      const image = new Image(f.url, f.publicId, f.userId, f.metadata);
      image.id = f._id.toString();
      return image;
    });
  }

  async delete(id: string): Promise<void> {
    await this.imageModel.findByIdAndDelete(id).exec();
  }
}
