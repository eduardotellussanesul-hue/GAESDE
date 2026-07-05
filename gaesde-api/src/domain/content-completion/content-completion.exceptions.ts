export class ContentCompletionNotFoundException extends Error {
  constructor(id: string) {
    super(`Content completion with ID ${id} not found`);
    this.name = 'ContentCompletionNotFoundException';
  }
}

export class ContentAlreadyCompletedException extends Error {
  constructor(userId: string, contentId: string) {
    super(`User ${userId} already completed content ${contentId}`);
    this.name = 'ContentAlreadyCompletedException';
  }
}
