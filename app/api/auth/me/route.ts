import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const tokenUser = getTokenFromRequest(req);
    if (!tokenUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            course: true,
            semester: true,
            section: true,
            department: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            teacherId: true,
            name: true,
            designation: true,
            department: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    return successResponse(user);
  } catch (error: any) {
    return unauthorizedResponse('Invalid or expired session');
  }
}
