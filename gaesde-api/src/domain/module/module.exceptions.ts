export class ModuleNotFoundException extends Error {
  constructor(id: string) {
    super(`Module with ID ${id} not found`);
    this.name = 'ModuleNotFoundException';
  }
}

export class ModuleAlreadyExistsException extends Error {
  constructor(title: string) {
    super(`Module with title ${title} already exists in this course`);
    this.name = 'ModuleAlreadyExistsException';
  }
}
