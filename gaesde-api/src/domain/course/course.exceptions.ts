export class CourseNotFoundException extends Error {
  constructor(id: string) {
    super(`Course with ID ${id} not found`);
    this.name = 'CourseNotFoundException';
  }
}

export class CourseAlreadyExistsException extends Error {
  constructor(slug: string) {
    super(`Course with slug ${slug} already exists`);
    this.name = 'CourseAlreadyExistsException';
  }
}

export class CourseNotPublishedException extends Error {
  constructor(id: string) {
    super(`Course ${id} is not published`);
    this.name = 'CourseNotPublishedException';
  }
}

export class CourseDeletedException extends Error {
  constructor(id: string) {
    super(`Course ${id} has been deleted`);
    this.name = 'CourseDeletedException';
  }
}
