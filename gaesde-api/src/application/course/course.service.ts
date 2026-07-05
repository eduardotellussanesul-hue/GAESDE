import { Injectable, Inject } from '@nestjs/common';
import type { ICourseRepository } from '../../domain/course/course.repository.interface';
import { Course, CourseStatus, CourseLevel } from '../../domain/course/course.entity';
import { CourseNotFoundException, CourseAlreadyExistsException } from '../../domain/course/course.exceptions';

@Injectable()
export class CourseService {
  constructor(
    @Inject('ICourseRepository') private courseRepository: ICourseRepository,
  ) {}

  async create(data: {
    title: string;
    slug: string;
    instructorId: string;
    level: CourseLevel;
    price?: number;
    description?: string;
    coverImage?: string;
    categoryId?: string;
    status?: CourseStatus;
  }): Promise<any> {
    const existing = await this.courseRepository.findBySlug(data.slug);
    if (existing) {
      throw new CourseAlreadyExistsException(data.slug);
    }

    const course = new Course(
      data.title,
      data.slug,
      data.instructorId,
      data.level,
      data.price || 0,
      data.description,
      data.coverImage,
      data.categoryId,
      data.status || CourseStatus.DRAFT,
    );

    const saved = await this.courseRepository.save(course);
    return this.mapToResponse(saved);
  }

  async findAll(): Promise<any[]> {
    const courses = await this.courseRepository.findAll();
    return courses.map(course => this.mapToResponse(course));
  }

  async findPublished(): Promise<any[]> {
    const courses = await this.courseRepository.findPublished();
    return courses.map(course => this.mapToResponse(course));
  }

  async findById(id: string): Promise<any> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new CourseNotFoundException(id);
    }
    return this.mapToResponse(course);
  }

  async findBySlug(slug: string): Promise<any> {
    const course = await this.courseRepository.findBySlug(slug);
    if (!course) {
      throw new CourseNotFoundException(slug);
    }
    return this.mapToResponse(course);
  }

  async findByInstructor(instructorId: string): Promise<any[]> {
    const courses = await this.courseRepository.findByInstructor(instructorId);
    return courses.map(course => this.mapToResponse(course));
  }

  async findByCategory(categoryId: string): Promise<any[]> {
    const courses = await this.courseRepository.findByCategory(categoryId);
    return courses.map(course => this.mapToResponse(course));
  }

  async findByStatus(status: CourseStatus): Promise<any[]> {
    const courses = await this.courseRepository.findByStatus(status);
    return courses.map(course => this.mapToResponse(course));
  }

  async update(id: string, data: {
    title?: string;
    slug?: string;
    description?: string;
    coverImage?: string;
    price?: number;
    status?: CourseStatus;
    level?: CourseLevel;
    categoryId?: string;
  }): Promise<any> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new CourseNotFoundException(id);
    }

    if (data.title) course.title = data.title;
    if (data.slug) course.slug = data.slug;
    if (data.description !== undefined) course.description = data.description;
    if (data.coverImage !== undefined) course.coverImage = data.coverImage;
    if (data.price !== undefined) course.price = data.price;
    if (data.status) course.status = data.status;
    if (data.level) course.level = data.level;
    if (data.categoryId !== undefined) course.categoryId = data.categoryId;

    const updated = await this.courseRepository.update(id, course);
    if (!updated) {
      throw new CourseNotFoundException(id);
    }
    return this.mapToResponse(updated);
  }

  async publish(id: string): Promise<any> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new CourseNotFoundException(id);
    }
    course.publish();
    const updated = await this.courseRepository.update(id, course);
    return this.mapToResponse(updated);
  }

  async archive(id: string): Promise<any> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new CourseNotFoundException(id);
    }
    course.archive();
    const updated = await this.courseRepository.update(id, course);
    return this.mapToResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new CourseNotFoundException(id);
    }
    course.softDelete();
    await this.courseRepository.update(id, course);
  }

  async hardDelete(id: string): Promise<void> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new CourseNotFoundException(id);
    }
    await this.courseRepository.hardDelete(id);
  }

  async restore(id: string): Promise<any> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new CourseNotFoundException(id);
    }
    course.restore();
    const updated = await this.courseRepository.update(id, course);
    return this.mapToResponse(updated);
  }

  private mapToResponse(course: Course): any {
    return course.toJSON();
  }
}
