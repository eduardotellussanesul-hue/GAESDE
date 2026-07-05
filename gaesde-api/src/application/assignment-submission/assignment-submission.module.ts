import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { 
  AssignmentSubmissionRepository, 
  AssignmentSubmissionSchema 
} from '../../infrastructure/repositories/assignment-submission.repository.impl';
import { AssignmentSubmissionService } from './assignment-submission.service';
import { AssignmentSubmissionController } from '../../presentation/controllers/assignments/assignment-submission.controller';
import { ContentModule } from '../content/content.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AssignmentSubmission', schema: AssignmentSubmissionSchema }]),
    ContentModule,
    EnrollmentModule,
  ],
  providers: [
    AssignmentSubmissionService,
    { provide: 'IAssignmentSubmissionRepository', useClass: AssignmentSubmissionRepository },
  ],
  controllers: [AssignmentSubmissionController],
  exports: [AssignmentSubmissionService],
})
export class AssignmentSubmissionModule {}
