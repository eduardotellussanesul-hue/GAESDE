import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageRepository, ImageSchema } from '../../infrastructure/repositories/image.repository.impl';
import { ImageService } from './image.service';
import { ImageController } from '../../presentation/controllers/images/image.controller';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Image', schema: ImageSchema }]),
    CloudinaryModule,
  ],
  providers: [
    ImageService,
    { provide: 'IImageRepository', useClass: ImageRepository },
  ],
  controllers: [ImageController],
})
export class ImageModule {}
