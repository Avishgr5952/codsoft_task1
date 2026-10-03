import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        teachers: {
          select: {
            id: true,
            teacherId: true,
            name: true,
            email: true,
            designation: true,
            status: true,
          },
        },
        students: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            email: true,
            semester: true,
            section: true,
            status: true,
          },
        },
        subjects: {
          include: {
            teacher: { select: { name: true } },
          },
        },
      },
    });

    if (!department) return notFoundResponse('Department not found');

    return successResponse(department);
  } catch (error: any) {
    return errorResponse('Failed to fetch department');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const body = await req.json();
    const { code, name, description } = body;

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        name: name ? name.trim() : undefined,
        description: description !== undefined ? description?.trim() : undefined,
      },
    });

    return successResponse(department, 'Department updated successfully');
  } catch (error: any) {
    return errorResponse('Failed to update department');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    // Check if department has linked students, teachers, or subjects
    const [studentsCount, teachersCount, subjectsCount] = await Promise.all([
      prisma.student.count({ where: { departmentId: params.id } }),
      prisma.teacher.count({ where: { departmentId: params.id } }),
      prisma.subject.count({ where: { departmentId: params.id } }),
    ]);

    if (studentsCount > 0 || teachersCount > 0 || subjectsCount > 0) {
      return errorResponse(
        `Cannot delete department because it still has ${studentsCount} students, ${teachersCount} teachers, and ${subjectsCount} subjects associated with it. Please reassign or delete them first.`,
        400
      );
    }

    await prisma.department.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Department deleted successfully');
  } catch (error: any) {
    return errorResponse('Failed to delete department');
  }
}
