import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  constructor(message, statusCode = StatusCodes.BAD_REQUEST, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
