import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

// GET /api/exams - List exams with department, semester, subject filter
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId');
    const semester = searchParams.get('semester');
    const subjectId = searchParams.get('subjectId');

    const exams = await prisma.exam.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { examCode: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          departmentId ? { departmentId } : {},
          semester ? { semester: parseInt(semester, 10) } : {},
          subjectId ? { subjectId } : {},
        ],
      },
      include: {
        department: { select: { id: true, code: true, name: true } },
        subject: { select: { id: true, code: true, name: true } },
        _count: {
          select: { results: true },
        },
      },
      orderBy: { examDate: 'desc' },
    });

    return successResponse(exams);
  } catch (error: any) {
    return errorResponse('Failed to fetch exams');
  }
}

// POST /api/exams - Create exam (Admin or Teacher)
export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN', 'TEACHER'])) return forbiddenResponse();

    const body = await req.json();
    const {
      examCode,
      name,
      departmentId,
      subjectId,
      semester = 1,
      examDate,
      startTime = '10:00 AM',
      durationMinutes = 180,
      maxMarks = 100,
      passMarks = 40,
    } = body;

    if (!examCode || !name || !departmentId || !subjectId || !examDate) {
      return errorResponse('Exam code, name, department, subject, and date are required', 400);
    }

    const cleanCode = examCode.trim().toUpperCase();

    // Check duplicate code
    const existing = await prisma.exam.findUnique({
      where: { examCode: cleanCode },
    });

    if (existing) {
      return errorResponse(`Exam with code ${cleanCode} already exists`, 409);
    }

    const exam = await prisma.exam.create({
      data: {
        examCode: cleanCode,
        name: name.trim(),
        departmentId,
        subjectId,
        semester: Number(semester) || 1,
        examDate: new Date(examDate),
        startTime: startTime || '10:00 AM',
        durationMinutes: Number(durationMinutes) || 180,
        maxMarks: Number(maxMarks) || 100,
        passMarks: Number(passMarks) || 40,
      },
      include: {
        department: true,
        subject: true,
      },
    });

    return successResponse(exam, 'Exam created successfully', 201);
  } catch (error: any) {
    return errorResponse('Failed to create exam');
  }
}
