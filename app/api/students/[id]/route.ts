import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        attendances: {
          orderBy: { date: 'desc' },
          include: {
            subject: { select: { code: true, name: true } },
          },
        },
        examResults: {
          orderBy: { createdAt: 'desc' },
          include: {
            exam: {
              include: {
                subject: { select: { code: true, name: true } },
              },
            },
          },
        },
        feePayments: {
          orderBy: { createdAt: 'desc' },
        },
        academicRecords: {
          orderBy: { semester: 'desc' },
        },
      },
    });

    if (!student) return notFoundResponse('Student not found');

    // Attendance stats
    const totalClasses = student.attendances.length;
    const presentClasses = student.attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage =
      totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100 * 10) / 10 : 0;

    return successResponse({
      ...student,
      attendancePercentage,
      totalClasses,
    });
  } catch (error: any) {
    return errorResponse('Failed to fetch student details');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      departmentId,
      course,
      semester,
      section,
      status,
    } = body;

    const student = await prisma.$transaction(async (tx) => {
      const updated = await tx.student.update({
        where: { id: params.id },
        data: {
          firstName: firstName ? firstName.trim() : undefined,
          lastName: lastName ? lastName.trim() : undefined,
          phone: phone !== undefined ? phone?.trim() : undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender: gender || undefined,
          address: address !== undefined ? address?.trim() : undefined,
          departmentId: departmentId || undefined,
          course: course ? course.trim() : undefined,
          semester: semester !== undefined ? Number(semester) : undefined,
          section: section ? section.trim() : undefined,
          status: status || undefined,
        },
      });

      if (updated.userId && (firstName || lastName)) {
        await tx.user.update({
          where: { id: updated.userId },
          data: {
            name: `${firstName ? firstName.trim() : updated.firstName} ${
              lastName ? lastName.trim() : updated.lastName
            }`,
          },
        });
      }

      return updated;
    });

    return successResponse(student, 'Student updated successfully');
  } catch (error: any) {
    return errorResponse('Failed to update student');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const student = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!student) return notFoundResponse('Student not found');

    await prisma.$transaction(async (tx) => {
      await tx.student.delete({
        where: { id: params.id },
      });

      if (student.userId) {
        await tx.user.delete({
          where: { id: student.userId },
        });
      }
    });

    return successResponse(null, 'Student deleted successfully');
  } catch (error: any) {
    return errorResponse('Failed to delete student');
  }
}
