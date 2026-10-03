import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        subjects: true,
        attendancesMarked: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            subject: { select: { code: true, name: true } },
            student: { select: { studentId: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!teacher) return notFoundResponse('Teacher not found');

    return successResponse(teacher);
  } catch (error: any) {
    return errorResponse('Failed to fetch teacher details');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const body = await req.json();
    const { name, phone, designation, departmentId, status, subjectIds } = body;

    const updated = await prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.update({
        where: { id: params.id },
        data: {
          name: name ? name.trim() : undefined,
          phone: phone !== undefined ? phone?.trim() : undefined,
          designation: designation ? designation.trim() : undefined,
          departmentId: departmentId || undefined,
          status: status || undefined,
        },
      });

      // Update linked User name if exists
      if (teacher.userId && name) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: { name: name.trim() },
        });
      }

      // Reassign subjects if subjectIds provided
      if (Array.isArray(subjectIds)) {
        // Disconnect all current
        await tx.subject.updateMany({
          where: { teacherId: teacher.id },
          data: { teacherId: null },
        });
        // Connect new
        if (subjectIds.length > 0) {
          await tx.subject.updateMany({
            where: { id: { in: subjectIds } },
            data: { teacherId: teacher.id },
          });
        }
      }

      return teacher;
    });

    return successResponse(updated, 'Teacher updated successfully');
  } catch (error: any) {
    return errorResponse('Failed to update teacher');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
    });

    if (!teacher) return notFoundResponse('Teacher not found');

    await prisma.$transaction(async (tx) => {
      // Unlink subjects
      await tx.subject.updateMany({
        where: { teacherId: teacher.id },
        data: { teacherId: null },
      });

      // Delete teacher
      await tx.teacher.delete({
        where: { id: params.id },
      });

      // Delete linked user if any
      if (teacher.userId) {
        await tx.user.delete({
          where: { id: teacher.userId },
        });
      }
    });

    return successResponse(null, 'Teacher deleted successfully');
  } catch (error: any) {
    return errorResponse('Failed to delete teacher');
  }
}
