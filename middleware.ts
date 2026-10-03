import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    // Check expiry
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('edumanage_token')?.value;
  const user = token ? decodeJwtPayload(token) : null;

  // 1. If user visits /login while authenticated, redirect to their dashboard
  if (pathname === '/login' || pathname === '/') {
    if (user) {
      if (user.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (user.role === 'TEACHER') {
        return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
      } else if (user.role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }
    } else if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Protect Admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'ADMIN') {
      // Unauthorized role redirection
      if (user.role === 'TEACHER') {
        return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  // 3. Protect Teacher routes
  if (pathname.startsWith('/teacher')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  // 4. Protect Student routes
  if (pathname.startsWith('/student')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Students can access, Admin can also inspect if needed
    if (user.role !== 'STUDENT' && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/teacher/:path*', '/student/:path*'],
};
