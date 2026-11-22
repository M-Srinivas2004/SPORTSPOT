import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/security';
import { sendError } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.sportspot_session;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Authentication required. Please log in.', 401);
  }

  const payload = verifyToken(token);
  if (!payload) {
    return sendError(res, 'Invalid or expired session. Please log in again.', 401);
  }

  req.user = payload;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  let token = req.cookies?.sportspot_session;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

export function requireRole(...allowedRoles: Array<'ATHLETE' | 'SPONSOR' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
}
