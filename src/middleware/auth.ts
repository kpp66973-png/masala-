import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: typeof users.$inferSelect;
  isAdmin?: boolean;
}

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
  } catch (error) {
    console.warn('Optional auth token could not be verified, continuing as guest:', error);
  }
  next();
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const adminSecret = process.env.ADMIN_SECRET || 'masala_admin_2026';
  const adminHeader = req.headers['x-admin-key'] as string | undefined;

  // 1. Direct admin key check (for admin dashboard / management)
  if (adminHeader && adminHeader === adminSecret) {
    req.isAdmin = true;
    return next();
  }

  // 2. Token-based admin verification (Firebase Auth user with admin role or matching admin email)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      req.user = decoded;

      // Check admin email or database role
      const adminEmail = process.env.ADMIN_EMAIL || 'kpp66973@gmail.com';
      if (decoded.email && decoded.email.toLowerCase() === adminEmail.toLowerCase()) {
        req.isAdmin = true;
        return next();
      }

      // Query DB for user role
      const dbUsers = await db.select().from(users).where(eq(users.uid, decoded.uid)).limit(1);
      if (dbUsers.length > 0 && dbUsers[0].role === 'admin') {
        req.isAdmin = true;
        return next();
      }
    } catch (e) {
      console.error('Error verifying admin token:', e);
    }
  }

  return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
};
