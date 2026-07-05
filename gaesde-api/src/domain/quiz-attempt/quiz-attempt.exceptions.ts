export class QuizAttemptNotFoundException extends Error {
  constructor(id: string) {
    super(`Quiz attempt with ID ${id} not found`);
    this.name = 'QuizAttemptNotFoundException';
  }
}

export class QuizAttemptAlreadyFinishedException extends Error {
  constructor(id: string) {
    super(`Quiz attempt ${id} is already finished`);
    this.name = 'QuizAttemptAlreadyFinishedException';
  }
}

export class QuizAttemptLimitExceededException extends Error {
  constructor(maxAttempts: number) {
    super(`Maximum attempts (${maxAttempts}) exceeded`);
    this.name = 'QuizAttemptLimitExceededException';
  }
}
