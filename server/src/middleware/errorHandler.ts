import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';
  let details: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err.message.includes('SQLITE_CONSTRAINT')) {
    statusCode = 400;
    code = 'CONSTRAINT_ERROR';
    message = 'Database constraint violation';
  }

  const errorResponse: ApiError = {
    message,
    code,
    details
  };

  console.error('Error:', err);

  res.status(statusCode).json(errorResponse);
};