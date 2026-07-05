export class ContentNotFoundException extends Error {
  constructor(id: string) {
    super(`Content with ID ${id} not found`);
    this.name = 'ContentNotFoundException';
  }
}

export class ContentTypeNotSupportedException extends Error {
  constructor(type: string) {
    super(`Content type ${type} is not supported`);
    this.name = 'ContentTypeNotSupportedException';
  }
}

export class ContentVideoNotFoundException extends Error {
  constructor(contentId: string) {
    super(`Video content for ${contentId} not found`);
    this.name = 'ContentVideoNotFoundException';
  }
}

export class ContentTextNotFoundException extends Error {
  constructor(contentId: string) {
    super(`Text content for ${contentId} not found`);
    this.name = 'ContentTextNotFoundException';
  }
}

export class ContentPdfNotFoundException extends Error {
  constructor(contentId: string) {
    super(`PDF content for ${contentId} not found`);
    this.name = 'ContentPdfNotFoundException';
  }
}
