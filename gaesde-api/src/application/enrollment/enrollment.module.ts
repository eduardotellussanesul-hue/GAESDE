import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentRepository, EnrollmentSchema } from '../../infrastructure/repositories/enrollment.repository.impl';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from '../../presentation/controllers/enrollments/enrollment.controller';
import { CourseModule } from '../course/course.module';
import { ContentModule } from '../content/content.module';
import { UserModule } from '../user/user.module';
import { UserRoleModule } from '../user-role/user-role.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Enrollment', schema: EnrollmentSchema }]),
    CourseModule,
    ContentModule,
    UserModule,
    UserRoleModule,
  ],
  providers: [
    EnrollmentService,
    { provide: 'IEnrollmentRepository', useClass: EnrollmentRepository },
  ],
  controllers: [EnrollmentController],
  exports: [EnrollmentService, 'IEnrollmentRepository'], // Exportar o repositório
})
export class EnrollmentModule {}
