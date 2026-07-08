export class UserAnswer {
  private _id: string;
  private _attemptId: string;
  private _questionId: string;
  private _selectedOptionId?: string;
  private _selectedOptionIds?: string[];
  private _textResponse?: string;
  private _isCorrect?: boolean;
  private _pointsEarned: number;
  private _createdAt: Date;

  constructor(
    attemptId: string,
    questionId: string,
    pointsEarned: number = 0,
    selectedOptionId?: string,
    textResponse?: string,
    isCorrect?: boolean,
    selectedOptionIds?: string[],
  ) {
    this.validateAttemptId(attemptId);
    this.validateQuestionId(questionId);
    this.validatePointsEarned(pointsEarned);
    
    this._attemptId = attemptId;
    this._questionId = questionId;
    this._selectedOptionId = selectedOptionId;
    this._selectedOptionIds = selectedOptionIds;
    this._textResponse = textResponse;
    this._isCorrect = isCorrect;
    this._pointsEarned = pointsEarned;
    this._createdAt = new Date();
  }

  private validateAttemptId(attemptId: string): void {
    if (!attemptId || attemptId.trim().length < 1) {
      throw new Error('Attempt ID is required');
    }
  }

  private validateQuestionId(questionId: string): void {
    if (!questionId || questionId.trim().length < 1) {
      throw new Error('Question ID is required');
    }
  }

  private validatePointsEarned(points: number): void {
    if (points < 0) {
      throw new Error('Points earned must be greater than or equal to 0');
    }
  }

  get id(): string { return this._id; }
  get attemptId(): string { return this._attemptId; }
  get questionId(): string { return this._questionId; }
  get selectedOptionId(): string | undefined { return this._selectedOptionId; }
  get selectedOptionIds(): string[] | undefined { return this._selectedOptionIds; }
  get textResponse(): string | undefined { return this._textResponse; }
  get isCorrect(): boolean | undefined { return this._isCorrect; }
  get pointsEarned(): number { return this._pointsEarned; }
  get createdAt(): Date { return this._createdAt; }

  set id(id: string) { this._id = id; }
  set selectedOptionId(optionId: string | undefined) { this._selectedOptionId = optionId; }
  set selectedOptionIds(optionIds: string[] | undefined) {
    if (optionIds && optionIds.some(optionId => !optionId || optionId.trim().length < 1)) {
      throw new Error('Selected option IDs must be valid');
    }
    this._selectedOptionIds = optionIds;
  }
  set textResponse(response: string | undefined) { this._textResponse = response; }
  set isCorrect(isCorrect: boolean | undefined) { this._isCorrect = isCorrect; }
  set pointsEarned(points: number) {
    this.validatePointsEarned(points);
    this._pointsEarned = points;
  }

  toJSON() {
    return {
      id: this._id,
      attemptId: this._attemptId,
      questionId: this._questionId,
      selectedOptionId: this._selectedOptionId,
      selectedOptionIds: this._selectedOptionIds,
      textResponse: this._textResponse,
      isCorrect: this._isCorrect,
      pointsEarned: this._pointsEarned,
      createdAt: this._createdAt,
    };
  }
}
