export class QuestionOption {
  private _id: string;
  private _questionId: string;
  private _optionText: string;
  private _isCorrect: boolean;
  private _createdAt: Date;

  constructor(questionId: string, optionText: string, isCorrect: boolean = false) {
    this.validateQuestionId(questionId);
    this.validateOptionText(optionText);
    
    this._questionId = questionId;
    this._optionText = optionText;
    this._isCorrect = isCorrect;
    this._createdAt = new Date();
  }

  private validateQuestionId(questionId: string): void {
    if (!questionId || questionId.trim().length < 1) {
      throw new Error('Question ID is required');
    }
  }

  private validateOptionText(text: string): void {
    if (!text || text.trim().length < 1) {
      throw new Error('Option text is required');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get questionId(): string { return this._questionId; }
  get optionText(): string { return this._optionText; }
  get isCorrect(): boolean { return this._isCorrect; }
  get createdAt(): Date { return this._createdAt; }

  // Setters
  set id(id: string) { this._id = id; }
  set optionText(text: string) {
    this.validateOptionText(text);
    this._optionText = text;
  }
  set isCorrect(isCorrect: boolean) {
    this._isCorrect = isCorrect;
  }

  toJSON() {
    return {
      id: this._id,
      questionId: this._questionId,
      optionText: this._optionText,
      isCorrect: this._isCorrect,
      createdAt: this._createdAt,
    };
  }
}
