import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signJwtToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email/Username and password are required', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Determine dashboard redirect URL based on role
    let redirectUrl = '/admin/dashboard';
    if (user.role === 'TEACHER') {
      redirectUrl = '/teacher/dashboard';
    } else if (user.role === 'STUDENT') {
      redirectUrl = '/student/dashboard';
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      studentId: user.student?.id,
      teacherId: user.teacher?.id,
    };

    const token = signJwtToken(payload);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: payload,
        redirectUrl,
        token,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse('An unexpected error occurred during login. Please try again.', 500);
  }
}
