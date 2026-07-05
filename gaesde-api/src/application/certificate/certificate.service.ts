import { Injectable, Inject } from '@nestjs/common';
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
      .text('CERTIFICADO', 0, 70, { align: 'center' });

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
      .text('Certificamos que', 0, 140, { align: 'center' });

    // Nome do aluno
    doc.font('Helvetica-Bold')
      .fontSize(48)
      .fillColor('#2C3E50')
      .text(user.name, 0, 180, { align: 'center' });

    // Texto de conclusão
    doc.font('Helvetica')
      .fontSize(14)
      .fillColor('#555')
      .text('concluiu com sucesso o curso', 0, 250, { align: 'center' });

    // Nome do curso
    doc.font('Helvetica-Bold')
      .fontSize(28)
      .fillColor('#4A90D9')
      .text(course.title, 0, 290, { align: 'center' });

    // Descrição
    if (course.description) {
      doc.font('Helvetica')
        .fontSize(12)
        .fillColor('#555')
        .text(course.description.substring(0, 100), 0, 340, {
          align: 'center',
          width: width - 100,
        });
    }

    // Data
    doc.font('Helvetica')
      .fontSize(14)
      .fillColor('#555')
      .text(`Concluído em: ${date}`, 0, height - 100, { align: 'center' });

    // Rodapé
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#95A5A6')
      .text(`Código: ${verificationCode}`, 50, height - 40);
    
    doc.text('GAESDE', width - 50, height - 40, { align: 'right' });

    doc.font('Helvetica')
      .fontSize(8)
      .fillColor('#95A5A6')
      .text(`Verifique em: /certificates/verify/${verificationCode}`, 0, height - 20, { align: 'center' });

    doc.restore();
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
