import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['TEACHER', 'ADMIN'])) return forbiddenResponse();

    // Find teacher record
    const teacher = await prisma.teacher.findFirst({
      where: user.teacherId ? { id: user.teacherId } : { email: user.email },
      include: {
        department: true,
        subjects: {
          include: {
            department: true,
            _count: {
              select: { attendances: true, exams: true },
            },
          },
        },
      },
    });

    if (!teacher) {
      return errorResponse('Teacher profile not found', 404);
    }

    const subjectIds = teacher.subjects.map((s) => s.id);

    // Count students enrolled in the teacher's department & subjects
    const totalStudents = await prisma.student.count({
      where: {
        departmentId: teacher.departmentId,
        status: 'Active',
      },
    });

    // Upcoming exams for assigned subjects
    const upcomingExams = await prisma.exam.findMany({
      where: {
        subjectId: { in: subjectIds },
      },
      include: {
        subject: { select: { code: true, name: true } },
        _count: { select: { results: true } },
      },
      orderBy: { examDate: 'asc' },
      take: 5,
    });

    // Recent attendance marked
    const recentAttendances = await prisma.attendance.findMany({
      where: {
        subjectId: { in: subjectIds },
      },
      take: 6,
      orderBy: { date: 'desc' },
      include: {
        student: { select: { studentId: true, firstName: true, lastName: true } },
        subject: { select: { code: true, name: true } },
      },
    });

    return successResponse({
      teacher: {
        id: teacher.id,
        teacherId: teacher.teacherId,
        name: teacher.name,
        email: teacher.email,
        designation: teacher.designation,
        department: teacher.department.name,
      },
      summary: {
        assignedSubjectsCount: teacher.subjects.length,
        totalStudents,
        upcomingExamsCount: upcomingExams.length,
      },
      assignedSubjects: teacher.subjects,
      upcomingExams,
      recentAttendances,
    });
  } catch (error: any) {
    console.error('Teacher dashboard error:', error);
    return errorResponse('Failed to fetch teacher dashboard data');
  }
}
