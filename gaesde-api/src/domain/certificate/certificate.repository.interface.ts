import { Certificate } from './certificate.entity';

export interface ICertificateRepository {
  save(certificate: Certificate): Promise<Certificate>;
  findById(id: string): Promise<Certificate | null>;
  findByUser(userId: string): Promise<Certificate[]>;
  findByEnrollment(enrollmentId: string): Promise<Certificate | null>;
  findByVerificationCode(code: string): Promise<Certificate | null>;
  findAll(): Promise<Certificate[]>;
  delete(id: string): Promise<void>;
}
