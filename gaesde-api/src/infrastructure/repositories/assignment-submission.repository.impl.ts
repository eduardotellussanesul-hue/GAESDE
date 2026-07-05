import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { AssignmentSubmission } from '../../domain/assignment-submission/assignment-submission.entity';
import { IAssignmentSubmissionRepository } from '../../domain/assignment-submission/assignment-submission.repository.interface';

export interface AssignmentSubmissionDocument extends Document {
  content_id: string;
  user_id: string;
  enrollment_id: string;
  file_url: string;
  submitted_at: Date;
  grade?: number;
  instructor_feedback?: string;
  graded_at?: Date;
}

export const AssignmentSubmissionSchema = new Schema<AssignmentSubmissionDocument>(
  {
    content_id: {
      type: String,
      required: true,
      ref: 'Content',
    },
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    enrollment_id: {
      type: String,
      required: true,
      ref: 'Enrollment',
    },
    file_url: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    instructor_feedback: {
      type: String,
      required: false,
    },
    graded_at: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: 'submitted_at',
      updatedAt: false,
    },
  },
);

AssignmentSubmissionSchema.index({ content_id: 1, user_id: 1 }, { unique: true });
AssignmentSubmissionSchema.index({ content_id: 1 });
AssignmentSubmissionSchema.index({ user_id: 1 });

@Injectable()
export class AssignmentSubmissionRepository implements IAssignmentSubmissionRepository {
  constructor(@InjectModel('AssignmentSubmission') private submissionModel: Model<AssignmentSubmissionDocument>) {}

  async save(submission: AssignmentSubmission): Promise<AssignmentSubmission> {
    const newSubmission = new this.submissionModel({
      content_id: submission.contentId,
      user_id: submission.userId,
      enrollment_id: submission.enrollmentId,
      file_url: submission.fileUrl,
      grade: submission.gradeValue, // Usando gradeValue
      instructor_feedback: submission.instructorFeedback,
      graded_at: submission.gradedAt,
    });
    const saved = await newSubmission.save();
    submission.id = saved._id.toString();
    return submission;
  }

  async findById(id: string): Promise<AssignmentSubmission | null> {
    const found = await this.submissionModel.findById(id).exec();
    if (!found) return null;
    const submission = new AssignmentSubmission(
      found.content_id,
      found.user_id,
      found.enrollment_id,
      found.file_url,
    );
    submission.id = found._id.toString();
    return submission;
  }

  async findByUser(userId: string): Promise<AssignmentSubmission[]> {
    const found = await this.submissionModel.find({ user_id: userId }).exec();
    return found.map(f => {
      const submission = new AssignmentSubmission(
        f.content_id,
        f.user_id,
        f.enrollment_id,
        f.file_url,
      );
      submission.id = f._id.toString();
      return submission;
    });
  }

  async findByContent(contentId: string): Promise<AssignmentSubmission[]> {
    const found = await this.submissionModel.find({ content_id: contentId }).exec();
    return found.map(f => {
      const submission = new AssignmentSubmission(
        f.content_id,
        f.user_id,
        f.enrollment_id,
        f.file_url,
      );
      submission.id = f._id.toString();
      return submission;
    });
  }

  async findByEnrollment(enrollmentId: string): Promise<AssignmentSubmission[]> {
    const found = await this.submissionModel.find({ enrollment_id: enrollmentId }).exec();
    return found.map(f => {
      const submission = new AssignmentSubmission(
        f.content_id,
        f.user_id,
        f.enrollment_id,
        f.file_url,
      );
      submission.id = f._id.toString();
      return submission;
    });
  }

  async findByUserAndContent(userId: string, contentId: string): Promise<AssignmentSubmission | null> {
    const found = await this.submissionModel.findOne({
      user_id: userId,
      content_id: contentId,
    }).exec();
    if (!found) return null;
    const submission = new AssignmentSubmission(
      found.content_id,
      found.user_id,
      found.enrollment_id,
      found.file_url,
    );
    submission.id = found._id.toString();
    return submission;
  }

  async findAll(): Promise<AssignmentSubmission[]> {
    const found = await this.submissionModel.find().exec();
    return found.map(f => {
      const submission = new AssignmentSubmission(
        f.content_id,
        f.user_id,
        f.enrollment_id,
        f.file_url,
      );
      submission.id = f._id.toString();
      return submission;
    });
  }

  async update(id: string, data: Partial<AssignmentSubmission>): Promise<AssignmentSubmission | null> {
    const updateData: any = {};
    // Usando gradeValue para atualizar
    if (data['gradeValue'] !== undefined) updateData.grade = data['gradeValue'];
    if (data.instructorFeedback !== undefined) updateData.instructor_feedback = data.instructorFeedback;
    if (data['gradedAt'] !== undefined) updateData.graded_at = data['gradedAt'];

    const updated = await this.submissionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) return null;
    const submission = new AssignmentSubmission(
      updated.content_id,
      updated.user_id,
      updated.enrollment_id,
      updated.file_url,
    );
    submission.id = updated._id.toString();
    return submission;
  }

  async delete(id: string): Promise<void> {
    await this.submissionModel.findByIdAndDelete(id).exec();
  }
}
