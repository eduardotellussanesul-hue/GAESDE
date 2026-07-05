import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Enrollment, EnrollmentStatus } from '../../domain/enrollment/enrollment.entity';
import { IEnrollmentRepository } from '../../domain/enrollment/enrollment.repository.interface';

export interface EnrollmentDocument extends Document {
  user_id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  enrolled_at: Date;
  expires_at?: Date;
  last_accessed_at?: Date;
}

export const EnrollmentSchema = new Schema<EnrollmentDocument>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    course_id: {
      type: String,
      required: true,
      ref: 'Course',
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ACTIVE,
    },
    progress_percentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    expires_at: {
      type: Date,
      required: false,
    },
    last_accessed_at: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: 'enrolled_at',
      updatedAt: false,
    },
  },
);

EnrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });
EnrollmentSchema.index({ user_id: 1 });
EnrollmentSchema.index({ course_id: 1 });
EnrollmentSchema.index({ status: 1 });
EnrollmentSchema.index({ expires_at: 1 });

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(@InjectModel('Enrollment') private enrollmentModel: Model<EnrollmentDocument>) {}

  async save(enrollment: Enrollment): Promise<Enrollment> {
    const newEnrollment = new this.enrollmentModel({
      user_id: enrollment.userId,
      course_id: enrollment.courseId,
      status: enrollment.status,
      progress_percentage: enrollment.progressPercentage,
      expires_at: enrollment.expiresAt,
      last_accessed_at: enrollment.lastAccessedAt,
    });
    const saved = await newEnrollment.save();
    enrollment.id = saved._id.toString();
    return enrollment;
  }

  async findById(id: string): Promise<Enrollment | null> {
    const found = await this.enrollmentModel.findById(id).exec();
    if (!found) return null;
    return this.mapToEntity(found);
  }

  async findByUser(userId: string): Promise<Enrollment[]> {
    const found = await this.enrollmentModel.find({ user_id: userId }).exec();
    return found.map(f => this.mapToEntity(f));
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    const found = await this.enrollmentModel.find({ course_id: courseId }).exec();
    return found.map(f => this.mapToEntity(f));
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    const found = await this.enrollmentModel.findOne({ user_id: userId, course_id: courseId }).exec();
    if (!found) return null;
    return this.mapToEntity(found);
  }

  async findByStatus(status: EnrollmentStatus): Promise<Enrollment[]> {
    const found = await this.enrollmentModel.find({ status }).exec();
    return found.map(f => this.mapToEntity(f));
  }

  async findActive(): Promise<Enrollment[]> {
    const found = await this.enrollmentModel.find({ status: EnrollmentStatus.ACTIVE }).exec();
    return found.map(f => this.mapToEntity(f));
  }

  async findExpired(): Promise<Enrollment[]> {
    const now = new Date();
    const found = await this.enrollmentModel.find({
      status: EnrollmentStatus.ACTIVE,
      expires_at: { $lt: now },
    }).exec();
    return found.map(f => this.mapToEntity(f));
  }

  async findAll(): Promise<Enrollment[]> {
    const found = await this.enrollmentModel.find().exec();
    return found.map(f => this.mapToEntity(f));
  }

  async update(id: string, data: Partial<Enrollment>): Promise<Enrollment | null> {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.progressPercentage !== undefined) updateData.progress_percentage = data.progressPercentage;
    if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt;
    if (data.lastAccessedAt !== undefined) updateData.last_accessed_at = data.lastAccessedAt;

    const updated = await this.enrollmentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.enrollmentModel.findByIdAndDelete(id).exec();
  }

  private mapToEntity(doc: EnrollmentDocument): Enrollment {
    const enrollment = new Enrollment(
      doc.user_id,
      doc.course_id,
      doc.status as EnrollmentStatus,
      doc.progress_percentage,
      doc.expires_at || undefined,
    );
    enrollment.id = doc._id.toString();
    return enrollment;
  }
}
