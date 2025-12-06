import jwt from 'jsonwebtoken';

export interface UserSession {
  id: number;
  login: string;
  isAdmin: boolean;
  isExpert: boolean;
}

export function createToken(user: UserSession): string {
  return jwt.sign(
    user,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as UserSession;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
