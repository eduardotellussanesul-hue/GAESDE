import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewRepository, ReviewSchema } from '../../infrastructure/repositories/review.repository.impl';
import { ReviewService } from './review.service';
import { ReviewController } from '../../presentation/controllers/reviews/review.controller';
import { CourseModule } from '../course/course.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Review', schema: ReviewSchema }]),
    CourseModule,
    EnrollmentModule,
  ],
  providers: [
    ReviewService,
    { provide: 'IReviewRepository', useClass: ReviewRepository },
  ],
  controllers: [ReviewController],
  exports: [ReviewService],
})
export class ReviewModule {}
