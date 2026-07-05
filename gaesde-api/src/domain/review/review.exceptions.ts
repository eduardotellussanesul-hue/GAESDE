export class ReviewNotFoundException extends Error {
  constructor(id: string) {
    super(`Review with ID ${id} not found`);
    this.name = 'ReviewNotFoundException';
  }
}

export class ReviewAlreadyExistsException extends Error {
  constructor(userId: string, courseId: string) {
    super(`User ${userId} already reviewed course ${courseId}`);
    this.name = 'ReviewAlreadyExistsException';
  }
}

export class InvalidRatingException extends Error {
  constructor(rating: number) {
    super(`Rating ${rating} is invalid. Must be between 1 and 5`);
    this.name = 'InvalidRatingException';
  }
}
