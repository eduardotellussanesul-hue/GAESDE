import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Review } from '../../domain/review/review.entity';
import { IReviewRepository } from '../../domain/review/review.repository.interface';

export interface ReviewDocument extends Document {
  course_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: Date;
  updated_at: Date;
}

export const ReviewSchema = new Schema<ReviewDocument>(
  {
    course_id: {
      type: String,
      required: true,
      ref: 'Course',
    },
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
      maxlength: 2000,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

ReviewSchema.index({ course_id: 1, user_id: 1 }, { unique: true });
ReviewSchema.index({ course_id: 1 });
ReviewSchema.index({ user_id: 1 });
ReviewSchema.index({ rating: 1 });

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(@InjectModel('Review') private reviewModel: Model<ReviewDocument>) {}

  async save(review: Review): Promise<Review> {
    const newReview = new this.reviewModel({
      course_id: review.courseId,
      user_id: review.userId,
      rating: review.rating,
      comment: review.comment,
    });
    const saved = await newReview.save();
    review.id = saved._id.toString();
    return review;
  }

  async findById(id: string): Promise<Review | null> {
    const found = await this.reviewModel.findById(id).exec();
    if (!found) return null;
    const review = new Review(
      found.course_id,
      found.user_id,
      found.rating,
      found.comment || undefined,
    );
    review.id = found._id.toString();
    return review;
  }

  async findByCourse(courseId: string): Promise<Review[]> {
    const found = await this.reviewModel.find({ course_id: courseId }).exec();
    return found.map(f => {
      const review = new Review(
        f.course_id,
        f.user_id,
        f.rating,
        f.comment || undefined,
      );
      review.id = f._id.toString();
      return review;
    });
  }

  async findByUser(userId: string): Promise<Review[]> {
    const found = await this.reviewModel.find({ user_id: userId }).exec();
    return found.map(f => {
      const review = new Review(
        f.course_id,
        f.user_id,
        f.rating,
        f.comment || undefined,
      );
      review.id = f._id.toString();
      return review;
    });
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Review | null> {
    const found = await this.reviewModel.findOne({
      user_id: userId,
      course_id: courseId,
    }).exec();
    if (!found) return null;
    const review = new Review(
      found.course_id,
      found.user_id,
      found.rating,
      found.comment || undefined,
    );
    review.id = found._id.toString();
    return review;
  }

  async findAll(): Promise<Review[]> {
    const found = await this.reviewModel.find().exec();
    return found.map(f => {
      const review = new Review(
        f.course_id,
        f.user_id,
        f.rating,
        f.comment || undefined,
      );
      review.id = f._id.toString();
      return review;
    });
  }

  async update(id: string, data: Partial<Review>): Promise<Review | null> {
    const updateData: any = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;

    const updated = await this.reviewModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    const review = new Review(
      updated.course_id,
      updated.user_id,
      updated.rating,
      updated.comment || undefined,
    );
    review.id = updated._id.toString();
    return review;
  }

  async delete(id: string): Promise<void> {
    await this.reviewModel.findByIdAndDelete(id).exec();
  }

  async getAverageRating(courseId: string): Promise<number> {
    const result = await this.reviewModel.aggregate([
      { $match: { course_id: courseId } },
      { $group: { _id: null, average: { $avg: '$rating' } } },
    ]).exec();
    return result.length > 0 ? Math.round(result[0].average * 10) / 10 : 0;
  }

  async getRatingCount(courseId: string): Promise<number> {
    return this.reviewModel.countDocuments({ course_id: courseId }).exec();
  }
}
