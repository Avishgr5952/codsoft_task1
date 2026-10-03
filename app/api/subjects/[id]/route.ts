import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        teacher: true,
        exams: true,
      },
    });

    if (!subject) return notFoundResponse('Subject not found');

    return successResponse(subject);
  } catch (error: any) {
    return errorResponse('Failed to fetch subject');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const body = await req.json();
    const { code, name, departmentId, semester, credits, teacherId } = body;

    const subject = await prisma.subject.update({
      where: { id: params.id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        name: name ? name.trim() : undefined,
        departmentId: departmentId || undefined,
        semester: semester !== undefined ? Number(semester) : undefined,
        credits: credits !== undefined ? Number(credits) : undefined,
        teacherId: teacherId !== undefined ? (teacherId || null) : undefined,
      },
    });

    return successResponse(subject, 'Subject updated successfully');
  } catch (error: any) {
    return errorResponse('Failed to update subject');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    // Check linked attendances or exams
    const [attendanceCount, examsCount] = await Promise.all([
      prisma.attendance.count({ where: { subjectId: params.id } }),
      prisma.exam.count({ where: { subjectId: params.id } }),
    ]);

    if (attendanceCount > 0 || examsCount > 0) {
      return errorResponse(
        `Cannot delete subject because it has ${attendanceCount} attendance records and ${examsCount} exams associated with it.`,
        400
      );
    }

    await prisma.subject.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Subject deleted successfully');
  } catch (error: any) {
    return errorResponse('Failed to delete subject');
  }
}
