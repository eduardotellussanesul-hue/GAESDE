export class UserAnswerNotFoundException extends Error {
  constructor(id: string) {
    super(`User answer with ID ${id} not found`);
    this.name = 'UserAnswerNotFoundException';
  }
}

export class UserAnswerAlreadyExistsException extends Error {
  constructor(attemptId: string, questionId: string) {
    super(`Answer for attempt ${attemptId} and question ${questionId} already exists`);
    this.name = 'UserAnswerAlreadyExistsException';
  }
}
