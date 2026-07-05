export class AssignmentSubmissionNotFoundException extends Error {
  constructor(id: string) {
    super(`Assignment submission with ID ${id} not found`);
    this.name = 'AssignmentSubmissionNotFoundException';
  }
}

export class AssignmentAlreadySubmittedException extends Error {
  constructor(contentId: string, userId: string) {
    super(`User ${userId} already submitted assignment ${contentId}`);
    this.name = 'AssignmentAlreadySubmittedException';
  }
}
