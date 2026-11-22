import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.slice(1).join('.') || 'root';
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
        });
        return sendError(res, 'Validation failed. Please verify submitted fields.', 422, errors);
      }
      return sendError(res, 'Invalid request payload', 400);
    }
  };
}
