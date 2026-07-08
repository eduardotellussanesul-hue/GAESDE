import type { Certificate } from '../../../domain/entities/certificate';
import { asOptionalString, asRecord, asString } from './mapperUtils';

export function mapCertificate(input: unknown): Certificate {
  const item = asRecord(input);
  return {
    id: asString(item.id),
    enrollmentId: asString(item.enrollmentId),
    userId: asString(item.userId),
    certificateUrl: asString(item.certificateUrl),
    verificationCode: asString(item.verificationCode),
    issuedAt: asOptionalString(item.issuedAt),
  };
}