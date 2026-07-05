export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  ESSAY = 'essay',
  MATCHING = 'matching',
}

export class Question {
  private _id: string;
  private _quizId: string;
  private _type: QuestionType;
  private _questionText: string;
  private _points: number;
  private _orderIndex: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    quizId: string,
    type: QuestionType,
    questionText: string,
    points: number = 1,
    orderIndex: number = 0,
  ) {
    this.validateQuizId(quizId);
    this.validateQuestionText(questionText);
    this.validatePoints(points);
    
    this._quizId = quizId;
    this._type = type;
    this._questionText = questionText;
    this._points = points;
    this._orderIndex = orderIndex;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  private validateQuizId(quizId: string): void {
    if (!quizId || quizId.trim().length < 1) {
      throw new Error('Quiz ID is required');
    }
  }

  private validateQuestionText(text: string): void {
    if (!text || text.trim().length < 1) {
      throw new Error('Question text is required');
    }
  }

  private validatePoints(points: number): void {
    if (points < 0) {
      throw new Error('Points must be greater than or equal to 0');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get quizId(): string { return this._quizId; }
  get type(): QuestionType { return this._type; }
  get questionText(): string { return this._questionText; }
  get points(): number { return this._points; }
  get orderIndex(): number { return this._orderIndex; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Setters
  set id(id: string) { this._id = id; }
  set questionText(text: string) {
    this.validateQuestionText(text);
    this._questionText = text;
    this._updatedAt = new Date();
  }
  set points(points: number) {
    this.validatePoints(points);
    this._points = points;
    this._updatedAt = new Date();
  }
  set orderIndex(orderIndex: number) {
    if (orderIndex < 0) {
      throw new Error('Order index must be greater than or equal to 0');
    }
    this._orderIndex = orderIndex;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      quizId: this._quizId,
      type: this._type,
      questionText: this._questionText,
      points: this._points,
      orderIndex: this._orderIndex,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
