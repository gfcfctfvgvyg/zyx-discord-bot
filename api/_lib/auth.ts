import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { parse, serialize } from 'cookie';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'your-secret-key';
const COOKIE_NAME = 'zyx_auth_token';

export interface UserPayload {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function createToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: VercelResponse, token: string): void {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function clearAuthCookie(res: VercelResponse): void {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function getTokenFromRequest(req: VercelRequest): string | null {
  const cookies = parse(req.headers.cookie || '');
  return cookies[COOKIE_NAME] || null;
}

export function getCurrentUser(req: VercelRequest): UserPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(
  handler: (req: VercelRequest, res: VercelResponse, user: UserPayload) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return handler(req, res, user);
  };
}
