import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Category } from '../../domain/category/category.entity';
import { ICategoryRepository } from '../../domain/category/category.repository.interface';

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  parent_id?: string;
  created_at: Date;
}

export const CategorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
      lowercase: true,
    },
    parent_id: {
      type: String,
      required: false,
      ref: 'Category',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  },
);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parent_id: 1 });

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(@InjectModel('Category') private categoryModel: Model<CategoryDocument>) {}

  async save(category: Category): Promise<Category> {
    const newCategory = new this.categoryModel({
      name: category.name,
      slug: category.slug,
      parent_id: category.parentId,
    });
    const saved = await newCategory.save();
    category.id = saved._id.toString();
    return category;
  }

  async findById(id: string): Promise<Category | null> {
    const found = await this.categoryModel.findById(id).exec();
    if (!found) return null;
    const category = new Category(found.name, found.slug, found.parent_id || undefined);
    category.id = found._id.toString();
    return category;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const found = await this.categoryModel.findOne({ slug }).exec();
    if (!found) return null;
    const category = new Category(found.name, found.slug, found.parent_id || undefined);
    category.id = found._id.toString();
    return category;
  }

  async findAll(): Promise<Category[]> {
    const found = await this.categoryModel.find().exec();
    return found.map((f) => {
      const category = new Category(f.name, f.slug, f.parent_id || undefined);
      category.id = f._id.toString();
      return category;
    });
  }

  async findParents(): Promise<Category[]> {
    const found = await this.categoryModel.find({ parent_id: null }).exec();
    return found.map((f) => {
      const category = new Category(f.name, f.slug, f.parent_id || undefined);
      category.id = f._id.toString();
      return category;
    });
  }

  async findChildren(parentId: string): Promise<Category[]> {
    const found = await this.categoryModel.find({ parent_id: parentId }).exec();
    return found.map((f) => {
      const category = new Category(f.name, f.slug, f.parent_id || undefined);
      category.id = f._id.toString();
      return category;
    });
  }

  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.parentId !== undefined) updateData.parent_id = data.parentId;

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    const category = new Category(updated.name, updated.slug, updated.parent_id || undefined);
    category.id = updated._id.toString();
    return category;
  }

  async delete(id: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec();
  }
}
