import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Document } from 'mongoose';
import { Certificate } from '../../domain/certificate/certificate.entity';
import { ICertificateRepository } from '../../domain/certificate/certificate.repository.interface';

export interface CertificateDocument extends Document {
  enrollment_id: string;
  user_id: string;
  certificate_url: string;
  verification_code: string;
  issued_at: Date;
}

export const CertificateSchema = new Schema<CertificateDocument>(
  {
    enrollment_id: {
      type: String,
      required: true,
      unique: true,
      ref: 'Enrollment',
    },
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    certificate_url: {
      type: String,
      required: true,
    },
    verification_code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: {
      createdAt: 'issued_at',
      updatedAt: false,
    },
  },
);

// unique indexes for enrollment_id and verification_code already declared in schema fields
CertificateSchema.index({ user_id: 1 });

@Injectable()
export class CertificateRepository implements ICertificateRepository {
  constructor(@InjectModel('Certificate') private certificateModel: Model<CertificateDocument>) {}

  async save(certificate: Certificate): Promise<Certificate> {
    const newCertificate = new this.certificateModel({
      enrollment_id: certificate.enrollmentId,
      user_id: certificate.userId,
      certificate_url: certificate.certificateUrl,
      verification_code: certificate.verificationCode,
    });
    const saved = await newCertificate.save();
    certificate.id = saved._id.toString();
    return certificate;
  }

  async findById(id: string): Promise<Certificate | null> {
    const found = await this.certificateModel.findById(id).exec();
    if (!found) return null;
    const certificate = new Certificate(
      found.enrollment_id,
      found.user_id,
      found.certificate_url,
      found.verification_code,
    );
    certificate.id = found._id.toString();
    return certificate;
  }

  async findByUser(userId: string): Promise<Certificate[]> {
    const found = await this.certificateModel.find({ user_id: userId }).exec();
    return found.map(f => {
      const certificate = new Certificate(
        f.enrollment_id,
        f.user_id,
        f.certificate_url,
        f.verification_code,
      );
      certificate.id = f._id.toString();
      return certificate;
    });
  }

  async findByEnrollment(enrollmentId: string): Promise<Certificate | null> {
    const found = await this.certificateModel.findOne({ enrollment_id: enrollmentId }).exec();
    if (!found) return null;
    const certificate = new Certificate(
      found.enrollment_id,
      found.user_id,
      found.certificate_url,
      found.verification_code,
    );
    certificate.id = found._id.toString();
    return certificate;
  }

  async findByVerificationCode(code: string): Promise<Certificate | null> {
    const found = await this.certificateModel.findOne({ verification_code: code }).exec();
    if (!found) return null;
    const certificate = new Certificate(
      found.enrollment_id,
      found.user_id,
      found.certificate_url,
      found.verification_code,
    );
    certificate.id = found._id.toString();
    return certificate;
  }

  async findAll(): Promise<Certificate[]> {
    const found = await this.certificateModel.find().exec();
    return found.map(f => {
      const certificate = new Certificate(
        f.enrollment_id,
        f.user_id,
        f.certificate_url,
        f.verification_code,
      );
      certificate.id = f._id.toString();
      return certificate;
    });
  }

  async delete(id: string): Promise<void> {
    await this.certificateModel.findByIdAndDelete(id).exec();
  }
}
