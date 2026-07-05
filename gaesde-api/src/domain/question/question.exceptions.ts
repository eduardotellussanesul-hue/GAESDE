export class QuestionNotFoundException extends Error {
  constructor(id: string) {
    super(`Question with ID ${id} not found`);
    this.name = 'QuestionNotFoundException';
  }
}

export class InvalidQuestionTypeException extends Error {
  constructor(type: string) {
    super(`Invalid question type: ${type}`);
    this.name = 'InvalidQuestionTypeException';
  }
}

export class QuestionWithoutOptionsException extends Error {
  constructor(questionId: string) {
    super(`Question ${questionId} has no options`);
    this.name = 'QuestionWithoutOptionsException';
  }
}
