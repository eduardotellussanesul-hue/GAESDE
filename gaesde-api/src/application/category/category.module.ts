import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryRepository, CategorySchema } from '../../infrastructure/repositories/category.repository.impl';
import { CategoryService } from './category.service';
import { CategoryController } from '../../presentation/controllers/categories/category.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
  ],
  providers: [
    CategoryService,
    { provide: 'ICategoryRepository', useClass: CategoryRepository },
  ],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
