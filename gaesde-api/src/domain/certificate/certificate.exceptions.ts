export class CertificateNotFoundException extends Error {
  constructor(id: string) {
    super(`Certificate with ID ${id} not found`);
    this.name = 'CertificateNotFoundException';
  }
}

export class CertificateAlreadyExistsException extends Error {
  constructor(enrollmentId: string) {
    super(`Certificate for enrollment ${enrollmentId} already exists`);
    this.name = 'CertificateAlreadyExistsException';
  }
}

export class CertificateGenerationFailedException extends Error {
  constructor(message: string) {
    super(`Certificate generation failed: ${message}`);
    this.name = 'CertificateGenerationFailedException';
  }
}
