export class UserNotFoundException extends Error {
  constructor(id: string) {
    super(`User with ID ${id} not found`);
    this.name = 'UserNotFoundException';
  }
}

export class UserAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsException';
  }
}

export class InvalidCredentialsException extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsException';
  }
}

export class EmailNotVerifiedException extends Error {
  constructor() {
    super('Email not verified');
    this.name = 'EmailNotVerifiedException';
  }
}

export class UserDeletedException extends Error {
  constructor(id: string) {
    super(`User with ID ${id} has been deleted`);
    this.name = 'UserDeletedException';
  }
}
