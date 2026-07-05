export class QuestionOptionNotFoundException extends Error {
  constructor(id: string) {
    super(`Question option with ID ${id} not found`);
    this.name = 'QuestionOptionNotFoundException';
  }
}

export class QuestionOptionAlreadyExistsException extends Error {
  constructor(questionId: string, optionText: string) {
    super(`Option "${optionText}" already exists for question ${questionId}`);
    this.name = 'QuestionOptionAlreadyExistsException';
  }
}
