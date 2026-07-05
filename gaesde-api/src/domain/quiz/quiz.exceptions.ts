export class QuizNotFoundException extends Error {
  constructor(id: string) {
    super(`Quiz with ID ${id} not found`);
    this.name = 'QuizNotFoundException';
  }
}

export class QuizAlreadyExistsException extends Error {
  constructor(contentId: string) {
    super(`Quiz for content ${contentId} already exists`);
    this.name = 'QuizAlreadyExistsException';
  }
}

export class QuizAttemptLimitExceededException extends Error {
  constructor(maxAttempts: number) {
    super(`Maximum attempts (${maxAttempts}) exceeded`);
    this.name = 'QuizAttemptLimitExceededException';
  }
}
