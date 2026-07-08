import type { Certificate } from '../entities/certificate';

export interface CertificateRepository {
  listMyCertificates(token: string): Promise<Certificate[]>;
  generateCertificate(token: string, enrollmentId: string): Promise<Certificate>;
  generateMyCertificate(token: string, enrollmentId: string): Promise<Certificate>;
}