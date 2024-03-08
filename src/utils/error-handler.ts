export class BadRequestException {
  constructor(message: string) {
      this.status = 400;
      this.message = message;
  }

  status: number;
  message: string;
}

export class AuthorizedTokenException {
  constructor(message: string) {
      this.status = 401;
      this.message = message;
  }

  status: number;
  message: string;
}

export class NotFoundException {
    constructor(message: string) {
      this.status = 404;
      this.message = message;
    }
  
    status: number;
    message: string;
  
}