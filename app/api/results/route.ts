import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { calculateGradeAndStatus } from '@/utils/grades';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

// GET /api/results - List results with examId or studentId filter
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');
    let studentId = searchParams.get('studentId');

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { userId: user.id },
      });
      if (!student) return errorResponse('Student not found', 404);
      studentId = student.id;
    }

    const results = await prisma.examResult.findMany({
      where: {
        AND: [
          examId ? { examId } : {},
          studentId ? { studentId } : {},
        ],
      },
      include: {
        exam: {
          include: {
            subject: { select: { code: true, name: true } },
            department: { select: { code: true, name: true } },
          },
        },
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            section: true,
          },
        },
      },
      orderBy: { marksObtained: 'desc' },
    });

    return successResponse(results);
  } catch (error: any) {
    return errorResponse('Failed to fetch results');
  }
}

// POST /api/results - Enter or update student marks in bulk or single
export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN', 'TEACHER'])) return forbiddenResponse();

    const body = await req.json();
    const { examId, results } = body;

    // results: Array<{ studentId: string, marksObtained: number, remarks?: string }>
    if (!examId || !Array.isArray(results) || results.length === 0) {
      return errorResponse('Exam ID and results array are required', 400);
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return errorResponse('Exam not found', 404);
    }

    const maxMarks = exam.maxMarks;

    const savedResults = await prisma.$transaction(
      results.map((r: any) => {
        const marks = Number(r.marksObtained);
        const { percentage, grade, status } = calculateGradeAndStatus(marks, maxMarks);

        return prisma.examResult.upsert({
          where: {
            examId_studentId: {
              examId,
              studentId: r.studentId,
            },
          },
          update: {
            marksObtained: marks,
            maxMarks,
            percentage,
            grade,
            status,
            remarks: r.remarks || null,
          },
          create: {
            examId,
            studentId: r.studentId,
            marksObtained: marks,
            maxMarks,
            percentage,
            grade,
            status,
            remarks: r.remarks || null,
          },
        });
      })
    );

    return successResponse(savedResults, `Successfully saved results for ${savedResults.length} students`);
  } catch (error: any) {
    console.error('Error saving exam results:', error);
    return errorResponse(error.message || 'Failed to save exam results');
  }
}
