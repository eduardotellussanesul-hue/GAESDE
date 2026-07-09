import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
// Importação correta para pdfkit
import PDFDocument from 'pdfkit';
import type { ICertificateRepository } from '../../domain/certificate/certificate.repository.interface';
import type { IEnrollmentRepository } from '../../domain/enrollment/enrollment.repository.interface';
import type { IUserRepository } from '../../domain/user/user.repository.interface';
import type { ICourseRepository } from '../../domain/course/course.repository.interface';
import { Certificate } from '../../domain/certificate/certificate.entity';
import { 
  CertificateNotFoundException, 
  CertificateAlreadyExistsException,
  CertificateGenerationFailedException,
} from '../../domain/certificate/certificate.exceptions';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';

@Injectable()
export class CertificateService {
  constructor(
    @Inject('ICertificateRepository') private certificateRepository: ICertificateRepository,
    @Inject('IEnrollmentRepository') private enrollmentRepository: IEnrollmentRepository,
    @Inject('IUserRepository') private userRepository: IUserRepository,
    @Inject('ICourseRepository') private courseRepository: ICourseRepository,
    private cloudinaryService: CloudinaryService,
  ) {}

  async generateCertificate(enrollmentId: string): Promise<any> {
    const existing = await this.certificateRepository.findByEnrollment(enrollmentId);
    if (existing) {
      throw new CertificateAlreadyExistsException(enrollmentId);
    }

    const context = await this.getGenerationContext(enrollmentId);
    return this.createAndSaveCertificate(context.enrollmentId, context.user, context.course);
  }

  async generateCertificateForUser(userId: string, enrollmentId: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (enrollment.userId !== userId) {
      throw new ForbiddenException('You can only generate certificates for your own enrollments');
    }

    return this.generateCertificate(enrollmentId);
  }

  async regenerateCertificate(enrollmentId: string): Promise<any> {
    const existing = await this.certificateRepository.findByEnrollment(enrollmentId);
    if (existing) {
      await this.certificateRepository.delete(existing.id);
    }

    const context = await this.getGenerationContext(enrollmentId);
    return this.createAndSaveCertificate(context.enrollmentId, context.user, context.course);
  }

  async regenerateCertificateForUser(userId: string, enrollmentId: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (enrollment.userId !== userId) {
      throw new ForbiddenException('You can only regenerate certificates for your own enrollments');
    }

    return this.regenerateCertificate(enrollmentId);
  }

  private async getGenerationContext(enrollmentId: string): Promise<{ enrollmentId: string; user: any; course: any }> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (!enrollment.isCompleted) {
      throw new Error('Course not completed');
    }

    const user = await this.userRepository.findById(enrollment.userId);
    const course = await this.courseRepository.findById(enrollment.courseId);

    if (!user || !course) {
      throw new Error('User or course not found');
    }

    return { enrollmentId, user, course };
  }

  private async createAndSaveCertificate(enrollmentId: string, user: any, course: any): Promise<any> {
    const verificationCode = this.generateVerificationCode();

    const pdfUrl = await this.generateCertificatePdf(user, course, verificationCode);

    const certificate = new Certificate(
      enrollmentId,
      user.id,
      pdfUrl,
      verificationCode,
    );
    const saved = await this.certificateRepository.save(certificate);
    return this.mapToResponse(saved);
  }

  private async generateCertificatePdf(user: any, course: any, verificationCode: string): Promise<string> {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50,
      });

      doc.on('data', (chunk) => chunks.push(chunk));
      
      const pdfBuffer = await new Promise<Buffer>((resolve) => {
        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        this.buildCertificatePDF(doc, user, course, verificationCode);
        doc.end();
      });

      const result = await this.cloudinaryService.uploadFile(
        {
          buffer: pdfBuffer,
          originalname: `certificate-${verificationCode}.pdf`,
          mimetype: 'application/pdf',
          size: pdfBuffer.length,
        } as Express.Multer.File,
        {
          folder: `certificates/${course.slug}`,
          public_id: `certificate-${verificationCode}`,
          resource_type: 'raw',
          type: 'upload',
        },
      );

      return result.url;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new CertificateGenerationFailedException(error.message);
    }
  }

  private buildCertificatePDF(
    doc: PDFKit.PDFDocument,
    user: any,
    course: any,
    verificationCode: string,
  ): void {
    const date = new Date().toLocaleDateString('pt-BR');
    const width = doc.page.width;
    const height = doc.page.height;
    const horizontalPadding = 60;
    const textWidth = width - (horizontalPadding * 2);
    const footerY = height - 85;
    const footerCodeY = height - 65;
    const footerVerifyY = height - 50;

    // Borda dourada
    doc.save();
    doc.rect(30, 30, width - 60, height - 60)
      .strokeColor('#C9A84C')
      .lineWidth(4)
      .stroke();

    // Segunda borda
    doc.rect(40, 40, width - 80, height - 80)
      .strokeColor('#C9A84C')
      .lineWidth(1)
      .stroke();

    // Título
    doc.font('Helvetica-Bold')
      .fontSize(42)
      .fillColor('#2C3E50')
      .text('CERTIFICADO', horizontalPadding, 70, { align: 'center', width: textWidth });

    // Linha decorativa
    doc.moveTo(width / 2 - 150, 120)
      .lineTo(width / 2 + 150, 120)
      .strokeColor('#C9A84C')
      .lineWidth(2)
      .stroke();

    // Subtítulo
    doc.font('Helvetica')
      .fontSize(16)
      .fillColor('#7F8C8D')
      .text('Certificamos que', horizontalPadding, 140, { align: 'center', width: textWidth });

    // Nome do aluno
    const fittedStudentName = this.fitTextToArea(doc, user.name, {
      font: 'Helvetica-Bold',
      maxFontSize: 48,
      minFontSize: 24,
      width: textWidth,
      maxHeight: 55,
    });

    doc.font('Helvetica-Bold')
      .fontSize(fittedStudentName.fontSize)
      .fillColor('#2C3E50')
      .text(fittedStudentName.text, horizontalPadding, 180, { align: 'center', width: textWidth });

    // Texto de conclusão
    doc.font('Helvetica')
      .fontSize(14)
      .fillColor('#555')
      .text('concluiu com sucesso o curso', horizontalPadding, 250, { align: 'center', width: textWidth });

    // Nome do curso
    const fittedCourseTitle = this.fitTextToArea(doc, course.title, {
      font: 'Helvetica-Bold',
      maxFontSize: 28,
      minFontSize: 16,
      width: textWidth,
      maxHeight: 45,
    });

    doc.font('Helvetica-Bold')
      .fontSize(fittedCourseTitle.fontSize)
      .fillColor('#4A90D9')
      .text(fittedCourseTitle.text, horizontalPadding, 290, { align: 'center', width: textWidth });

    // Descrição
    if (course.description) {
      doc.font('Helvetica')
        .fontSize(12)
        .fillColor('#555')
        .text(course.description.substring(0, 100), horizontalPadding, 340, {
          align: 'center',
          width: textWidth,
        });
    }

    // Data
    doc.font('Helvetica')
      .fontSize(14)
      .fillColor('#555')
      .text(`Concluído em: ${date}`, horizontalPadding, footerY, { align: 'center', width: textWidth });

    // Rodapé
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#95A5A6')
      .text(`Código: ${verificationCode}`, horizontalPadding, footerCodeY, {
        width: textWidth,
      });
    
    doc.text('GAESDE', horizontalPadding, footerCodeY, { align: 'right', width: textWidth });

    doc.font('Helvetica')
      .fontSize(8)
      .fillColor('#95A5A6')
      .text(`Verifique em: /certificates/verify/${verificationCode}`, horizontalPadding, footerVerifyY, {
        align: 'center',
        width: textWidth,
      });

    doc.restore();
  }

  private fitTextToArea(
    doc: PDFKit.PDFDocument,
    rawText: string,
    options: {
      font: string;
      maxFontSize: number;
      minFontSize: number;
      width: number;
      maxHeight: number;
    },
  ): { text: string; fontSize: number } {
    const sourceText = (rawText ?? '').trim() || '-';

    doc.font(options.font);

    for (let size = options.maxFontSize; size >= options.minFontSize; size -= 1) {
      doc.fontSize(size);
      const textHeight = doc.heightOfString(sourceText, {
        width: options.width,
        align: 'center',
      });

      if (textHeight <= options.maxHeight) {
        return { text: sourceText, fontSize: size };
      }
    }

    doc.fontSize(options.minFontSize);
    let trimmedText = sourceText;

    while (trimmedText.length > 3) {
      trimmedText = trimmedText.slice(0, -1).trimEnd();
      const candidate = `${trimmedText}...`;
      const candidateHeight = doc.heightOfString(candidate, {
        width: options.width,
        align: 'center',
      });

      if (candidateHeight <= options.maxHeight) {
        return { text: candidate, fontSize: options.minFontSize };
      }
    }

    return { text: '...', fontSize: options.minFontSize };
  }

  private generateVerificationCode(): string {
    return uuidv4();
  }

  async findById(id: string): Promise<any> {
    const certificate = await this.certificateRepository.findById(id);
    if (!certificate) {
      throw new CertificateNotFoundException(id);
    }
    return this.mapToResponse(certificate);
  }

  async findByUser(userId: string): Promise<any[]> {
    const certificates = await this.certificateRepository.findByUser(userId);
    return certificates.map(c => this.mapToResponse(c));
  }

  async findByVerificationCode(code: string): Promise<any> {
    if (!code || code === 'null' || code === 'undefined' || code.trim() === '') {
      throw new CertificateNotFoundException('Invalid verification code');
    }
    
    const certificate = await this.certificateRepository.findByVerificationCode(code);
    if (!certificate) {
      throw new CertificateNotFoundException(`Verification code ${code} not found`);
    }
    return this.mapToResponse(certificate);
  }

  async verifyCertificate(code: string): Promise<any> {
    if (!code || code === 'null' || code === 'undefined' || code.trim() === '') {
      return { valid: false, message: 'Invalid verification code' };
    }
    
    const certificate = await this.certificateRepository.findByVerificationCode(code);
    if (!certificate) {
      return { valid: false, message: 'Certificate not found' };
    }
    return {
      valid: true,
      certificate: this.mapToResponse(certificate),
    };
  }

  private mapToResponse(certificate: Certificate): any {
    return certificate.toJSON();
  }
}
