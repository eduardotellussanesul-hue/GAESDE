import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificateRepository, CertificateSchema } from '../../infrastructure/repositories/certificate.repository.impl';
import { CertificateService } from './certificate.service';
import { CertificateController } from '../../presentation/controllers/certificates/certificate.controller';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { CourseModule } from '../course/course.module';
import { UserModule } from '../user/user.module';
import { ContentCompletionModule } from '../content-completion/content-completion.module';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Certificate', schema: CertificateSchema }]),
    EnrollmentModule,
    CourseModule,
    UserModule,
    ContentCompletionModule, // Importar para ter acesso ao IContentCompletionRepository
    CloudinaryModule,
  ],
  providers: [
    CertificateService,
    { provide: 'ICertificateRepository', useClass: CertificateRepository },
  ],
  controllers: [CertificateController],
  exports: [CertificateService],
})
export class CertificateModule {}
