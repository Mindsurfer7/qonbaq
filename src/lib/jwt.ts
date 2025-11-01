import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

export function generateAccessToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

