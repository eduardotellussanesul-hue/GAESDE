import type { Certificate } from '../../../domain/entities/certificate';
import type { CertificateRepository } from '../../../domain/repositories/certificateRepository';
import { apiClient } from '../client';
import { mapCertificate } from '../mappers/certificateMapper';

export class CertificateApiRepository implements CertificateRepository {
  async listMyCertificates(token: string): Promise<Certificate[]> {
    const response = await apiClient.request<unknown[]>('/certificates/user', { method: 'GET', authToken: token });
    return response.map(mapCertificate);
  }

  async generateCertificate(token: string, enrollmentId: string): Promise<Certificate> {
    const response = await apiClient.request(`/certificates/generate/${enrollmentId}`, { method: 'POST', authToken: token });
    return mapCertificate(response);
  }

  async generateMyCertificate(token: string, enrollmentId: string): Promise<Certificate> {
    const response = await apiClient.request(`/certificates/my-enrollments/${enrollmentId}/generate`, {
      method: 'POST',
      authToken: token,
    });
    return mapCertificate(response);
  }
}