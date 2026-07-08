import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Course, CourseStatus, CourseLevel } from '../../domain/course/course.entity';
import { ICourseRepository } from '../../domain/course/course.repository.interface';

export interface CourseDocument extends Document {
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  price: number;
  status: string;
  level: string;
  instructor_id: string;
  category_id?: string;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export const CourseSchema = new Schema<CourseDocument>(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 200,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 200,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: false,
      maxlength: 5000,
    },
    cover_image: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
    },
    level: {
      type: String,
      required: true,
      enum: Object.values(CourseLevel),
    },
    instructor_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    category_id: {
      type: String,
      required: false,
      ref: 'Category',
    },
    published_at: {
      type: Date,
      required: false,
    },
    deleted_at: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

CourseSchema.index({ instructor_id: 1 });
CourseSchema.index({ category_id: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ level: 1 });
CourseSchema.index({ deleted_at: 1 });
CourseSchema.index({ title: 'text', description: 'text' });

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(@InjectModel('Course') private courseModel: Model<CourseDocument>) {}

  async save(course: Course): Promise<Course> {
    const newCourse = new this.courseModel({
      title: course.title,
      slug: course.slug,
      description: course.description,
      cover_image: course.coverImage,
      price: course.price,
      status: course.status,
      level: course.level,
      instructor_id: course.instructorId,
      category_id: course.categoryId,
      published_at: course.publishedAt,
    });
    const saved = await newCourse.save();
    course.id = saved._id.toString();
    return course;
  }

  async findById(id: string): Promise<Course | null> {
    const found = await this.courseModel.findById(id).exec();
    if (!found) return null;

    const course = new Course(
      found.title,
      found.slug,
      found.instructor_id,
      found.level as CourseLevel,
      found.price,
      found.description || undefined,
      found.cover_image || undefined,
      found.category_id || undefined,
      found.status as CourseStatus,
    );
    course.id = found._id.toString();
    return course;
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const found = await this.courseModel.findOne({ slug }).exec();
    if (!found) return null;

    const course = new Course(
      found.title,
      found.slug,
      found.instructor_id,
      found.level as CourseLevel,
      found.price,
      found.description || undefined,
      found.cover_image || undefined,
      found.category_id || undefined,
      found.status as CourseStatus,
    );
    course.id = found._id.toString();
    return course;
  }

  async findAll(): Promise<Course[]> {
    const found = await this.courseModel.find().exec();
    return found.map((f) => {
      const course = new Course(
        f.title,
        f.slug,
        f.instructor_id,
        f.level as CourseLevel,
        f.price,
        f.description || undefined,
        f.cover_image || undefined,
        f.category_id || undefined,
        f.status as CourseStatus,
      );
      course.id = f._id.toString();
      return course;
    });
  }

  async findPublished(): Promise<Course[]> {
    const found = await this.courseModel
      .find({ status: CourseStatus.PUBLISHED, deleted_at: null })
      .exec();
    return found.map((f) => {
      const course = new Course(
        f.title,
        f.slug,
        f.instructor_id,
        f.level as CourseLevel,
        f.price,
        f.description || undefined,
        f.cover_image || undefined,
        f.category_id || undefined,
        f.status as CourseStatus,
      );
      course.id = f._id.toString();
      return course;
    });
  }

  async findByInstructor(instructorId: string): Promise<Course[]> {
    const found = await this.courseModel
      .find({ instructor_id: instructorId, deleted_at: null })
      .exec();
    return found.map((f) => {
      const course = new Course(
        f.title,
        f.slug,
        f.instructor_id,
        f.level as CourseLevel,
        f.price,
        f.description || undefined,
        f.cover_image || undefined,
        f.category_id || undefined,
        f.status as CourseStatus,
      );
      course.id = f._id.toString();
      return course;
    });
  }

  async findByCategory(categoryId: string): Promise<Course[]> {
    const found = await this.courseModel
      .find({ category_id: categoryId, deleted_at: null })
      .exec();
    return found.map((f) => {
      const course = new Course(
        f.title,
        f.slug,
        f.instructor_id,
        f.level as CourseLevel,
        f.price,
        f.description || undefined,
        f.cover_image || undefined,
        f.category_id || undefined,
        f.status as CourseStatus,
      );
      course.id = f._id.toString();
      return course;
    });
  }

  async findByStatus(status: CourseStatus): Promise<Course[]> {
    const found = await this.courseModel
      .find({ status, deleted_at: null })
      .exec();
    return found.map((f) => {
      const course = new Course(
        f.title,
        f.slug,
        f.instructor_id,
        f.level as CourseLevel,
        f.price,
        f.description || undefined,
        f.cover_image || undefined,
        f.category_id || undefined,
        f.status as CourseStatus,
      );
      course.id = f._id.toString();
      return course;
    });
  }

  async findByLevel(level: CourseLevel): Promise<Course[]> {
    const found = await this.courseModel
      .find({ level, deleted_at: null })
      .exec();
    return found.map((f) => {
      const course = new Course(
        f.title,
        f.slug,
        f.instructor_id,
        f.level as CourseLevel,
        f.price,
        f.description || undefined,
        f.cover_image || undefined,
        f.category_id || undefined,
        f.status as CourseStatus,
      );
      course.id = f._id.toString();
      return course;
    });
  }

  async update(id: string, data: Partial<Course>): Promise<Course | null> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.coverImage !== undefined) updateData.cover_image = data.coverImage;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
    if (data.publishedAt !== undefined) updateData.published_at = data.publishedAt;
    if (data.deletedAt !== undefined) updateData.deleted_at = data.deletedAt;

    const updated = await this.courseModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;

    const course = new Course(
      updated.title,
      updated.slug,
      updated.instructor_id,
      updated.level as CourseLevel,
      updated.price,
      updated.description || undefined,
      updated.cover_image || undefined,
      updated.category_id || undefined,
      updated.status as CourseStatus,
    );
    course.id = updated._id.toString();
    return course;
  }

  async delete(id: string): Promise<void> {
    await this.courseModel.findByIdAndUpdate(id, { deleted_at: new Date() }).exec();
  }

  async hardDelete(id: string): Promise<void> {
    await this.courseModel.findByIdAndDelete(id).exec();
  }
}
