import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        subject: true,
        results: {
          include: {
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
        },
      },
    });

    if (!exam) return notFoundResponse('Exam not found');

    // Also get all eligible students for this department + semester
    const eligibleStudents = await prisma.student.findMany({
      where: {
        departmentId: exam.departmentId,
        semester: exam.semester,
        status: 'Active',
      },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        section: true,
      },
      orderBy: { studentId: 'asc' },
    });

    return successResponse({
      ...exam,
      eligibleStudents,
    });
  } catch (error: any) {
    return errorResponse('Failed to fetch exam details');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN', 'TEACHER'])) return forbiddenResponse();

    const body = await req.json();
    const { name, examDate, startTime, durationMinutes, maxMarks, passMarks } = body;

    const exam = await prisma.exam.update({
      where: { id: params.id },
      data: {
        name: name ? name.trim() : undefined,
        examDate: examDate ? new Date(examDate) : undefined,
        startTime: startTime || undefined,
        durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : undefined,
        maxMarks: maxMarks !== undefined ? Number(maxMarks) : undefined,
        passMarks: passMarks !== undefined ? Number(passMarks) : undefined,
      },
    });

    return successResponse(exam, 'Exam updated successfully');
  } catch (error: any) {
    return errorResponse('Failed to update exam');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    await prisma.exam.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Exam deleted successfully');
  } catch (error: any) {
    return errorResponse('Failed to delete exam');
  }
}
