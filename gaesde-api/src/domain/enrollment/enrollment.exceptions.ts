export class EnrollmentNotFoundException extends Error {
  constructor(id: string) {
    super(`Enrollment with ID ${id} not found`);
    this.name = 'EnrollmentNotFoundException';
  }
}

export class EnrollmentAlreadyExistsException extends Error {
  constructor(userId: string, courseId: string) {
    super(`User ${userId} is already enrolled in course ${courseId}`);
    this.name = 'EnrollmentAlreadyExistsException';
  }
}

export class EnrollmentNotActiveException extends Error {
  constructor(id: string) {
    super(`Enrollment ${id} is not active`);
    this.name = 'EnrollmentNotActiveException';
  }
}

export class EnrollmentExpiredException extends Error {
  constructor(id: string) {
    super(`Enrollment ${id} has expired`);
    this.name = 'EnrollmentExpiredException';
  }
}
