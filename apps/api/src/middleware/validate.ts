import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToParse: Record<string, any> = {};
      
      // Parse only the parts defined in schema
      if ('body' in schema.shape) dataToParse.body = req.body;
      if ('query' in schema.shape) dataToParse.query = req.query;
      if ('params' in schema.shape) dataToParse.params = req.params;

      const parsed = await schema.parseAsync(dataToParse);

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.') || 'root';
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
        });
        return sendError(res, 'Validation failed. Please verify submitted fields.', 422, errors);
      }
      return sendError(res, 'Invalid request payload', 400);
    }
  };
}
