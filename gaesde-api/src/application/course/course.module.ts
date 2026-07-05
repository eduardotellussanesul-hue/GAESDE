import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseRepository, CourseSchema } from '../../infrastructure/repositories/course.repository.impl';
import { CourseService } from './course.service';
import { CourseController } from '../../presentation/controllers/courses/course.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Course', schema: CourseSchema }]),
  ],
  providers: [
    CourseService,
    { provide: 'ICourseRepository', useClass: CourseRepository },
  ],
  controllers: [CourseController],
  exports: [CourseService, 'ICourseRepository'],
})
export class CourseModule {}
