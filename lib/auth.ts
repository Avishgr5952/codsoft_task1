import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifyJwtToken, TokenPayload } from './jwt';
import { Role } from '@/types';

export const AUTH_COOKIE_NAME = 'edumanage_token';

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJwtToken(token);
  } catch (e) {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): TokenPayload | null {
  try {
    // Check Authorization header first
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return verifyJwtToken(token);
    }

    // Check cookie
    const tokenCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (tokenCookie) {
      return verifyJwtToken(tokenCookie);
    }

    return null;
  } catch (e) {
    return null;
  }
}

export function authorize(user: TokenPayload | null, allowedRoles: Role[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
