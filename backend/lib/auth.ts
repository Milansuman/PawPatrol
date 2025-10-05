import jwt from 'jsonwebtoken';
import type { Context, Next } from 'hono';
import { hashPassword as cryptoHashPassword, verifyPassword as cryptoVerifyPassword } from './crypto.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface UserPayload {
  id: string;
  name: string;
  type: 'civilian' | 'shelter';
  shelterId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return cryptoHashPassword(password);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return cryptoVerifyPassword(password, hashedPassword);
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  c.set('user', payload);
  await next();
}

export async function shelterOnlyMiddleware(c: Context, next: Next) {
  const user = c.get('user') as UserPayload;
  
  if (user.type !== 'shelter') {
    return c.json({ error: 'Shelter access required' }, 403);
  }

  await next();
}