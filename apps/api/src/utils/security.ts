import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Hash password using Argon2id with high resistance to side-channel and GPU attacks
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

/**
 * Verify plaintext password against stored Argon2id hash
 */
export async function verifyPassword(hash: string, plaintext: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plaintext);
  } catch {
    return false;
  }
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'ATHLETE' | 'SPONSOR' | 'ADMIN';
  athleteId?: string;
  sponsorId?: string;
}

/**
 * Generate signed JWT for HTTP-only cookie sessions
 */
export function generateToken(payload: TokenPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as any });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
