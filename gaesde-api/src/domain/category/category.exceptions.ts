export class CategoryNotFoundException extends Error {
  constructor(id: string) {
    super(`Category with ID ${id} not found`);
    this.name = 'CategoryNotFoundException';
  }
}

export class CategoryAlreadyExistsException extends Error {
  constructor(slug: string) {
    super(`Category with slug ${slug} already exists`);
    this.name = 'CategoryAlreadyExistsException';
  }
}

export class InvalidCategoryException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCategoryException';
  }
}
