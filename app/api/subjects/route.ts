import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

// GET /api/subjects - List subjects with search, department, and semester filter
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId');
    const semester = searchParams.get('semester');

    const subjects = await prisma.subject.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { code: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          departmentId ? { departmentId } : {},
          semester ? { semester: parseInt(semester, 10) } : {},
        ],
      },
      include: {
        department: { select: { id: true, code: true, name: true } },
        teacher: { select: { id: true, teacherId: true, name: true, email: true } },
        _count: {
          select: {
            attendances: true,
            exams: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return successResponse(subjects);
  } catch (error: any) {
    return errorResponse('Failed to fetch subjects');
  }
}

// POST /api/subjects - Create subject (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const body = await req.json();
    const { code, name, departmentId, semester = 1, credits = 3, teacherId } = body;

    if (!code || !name || !departmentId) {
      return errorResponse('Subject Code, Subject Name, and Department are required', 400);
    }

    const cleanCode = code.trim().toUpperCase();

    // Check duplicate
    const existing = await prisma.subject.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return errorResponse(`Subject code ${cleanCode} already exists`, 409);
    }

    const subject = await prisma.subject.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        departmentId,
        semester: Number(semester) || 1,
        credits: Number(credits) || 3,
        teacherId: teacherId || null,
      },
      include: {
        department: true,
        teacher: true,
      },
    });

    return successResponse(subject, 'Subject created successfully', 201);
  } catch (error: any) {
    return errorResponse('Failed to create subject');
  }
}
