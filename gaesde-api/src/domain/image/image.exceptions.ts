export class ImageNotFoundException extends Error {
  constructor(id: string) {
    super(`Image with ID ${id} not found`);
    this.name = 'ImageNotFoundException';
  }
}

export class UploadFailedException extends Error {
  constructor(message: string = 'Image upload failed') {
    super(message);
    this.name = 'UploadFailedException';
  }
}

export class InvalidFileException extends Error {
  constructor(message: string = 'Invalid file') {
    super(message);
    this.name = 'InvalidFileException';
  }
}
