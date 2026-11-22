import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Unhandled Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    // Unique constraint violation code P2002
    if (err.code === 'P2002') {
      const target = err.meta?.target || 'field';
      return sendError(res, `A record with this ${target} already exists.`, 409);
    }
    // Record not found code P2025
    if (err.code === 'P2025') {
      return sendError(res, 'Requested resource was not found.', 404);
    }
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal server error';

  return sendError(res, message, err.statusCode || 500);
}
