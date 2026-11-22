import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}

export function sendError(
  res: Response,
  error: string = 'An unexpected error occurred',
  statusCode: number = 400,
  errors?: Record<string, string[]>
): Response {
  return res.status(statusCode).json({
    success: false,
    error,
    errors,
  });
}
