import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['STUDENT', 'ADMIN'])) return forbiddenResponse();

    // Find student record
    const student = await prisma.student.findFirst({
      where: user.studentId ? { id: user.studentId } : { email: user.email },
      include: {
        department: true,
      },
    });

    if (!student) {
      return errorResponse('Student profile not found', 404);
    }

    // 1. Attendance calculation
    const [attendances, totalClasses] = await Promise.all([
      prisma.attendance.findMany({
        where: { studentId: student.id },
        include: {
          subject: { select: { code: true, name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({
        where: { studentId: student.id },
      }),
    ]);

    const presentClasses = attendances.filter((a) => a.status === 'PRESENT').length;
    const lateClasses = attendances.filter((a) => a.status === 'LATE').length;
    const absentClasses = attendances.filter((a) => a.status === 'ABSENT').length;
    // Effective attendance: Present + Late counts as present or as per standard formula: (Present / Total) * 100
    const attendancePercentage =
      totalClasses > 0 ? Math.round(((presentClasses + lateClasses) / totalClasses) * 100 * 10) / 10 : 0;

    // 2. Enrolled Subjects
    const subjects = await prisma.subject.findMany({
      where: {
        departmentId: student.departmentId,
        semester: student.semester,
      },
      include: {
        teacher: { select: { name: true, email: true } },
      },
    });

    // 3. Upcoming Exams
    const upcomingExams = await prisma.exam.findMany({
      where: {
        departmentId: student.departmentId,
        semester: student.semester,
      },
      include: {
        subject: { select: { code: true, name: true } },
      },
      orderBy: { examDate: 'asc' },
    });

    // 4. Exam Results & Grades
    const results = await prisma.examResult.findMany({
      where: { studentId: student.id },
      include: {
        exam: {
          include: {
            subject: { select: { code: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 5. Fee Status
    const feePayments = await prisma.feePayment.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalFee = feePayments.reduce((acc, curr) => acc + curr.totalFee, 0);
    const amountPaid = feePayments.reduce((acc, curr) => acc + curr.amountPaid, 0);
    const remainingAmount = feePayments.reduce((acc, curr) => acc + curr.remainingAmount, 0);

    // 6. Academic Records
    const academicRecords = await prisma.academicRecord.findMany({
      where: { studentId: student.id },
      orderBy: { semester: 'desc' },
    });

    return successResponse({
      student,
      metrics: {
        attendancePercentage,
        totalClasses,
        presentClasses,
        lateClasses,
        absentClasses,
        currentSemester: student.semester,
        totalFee,
        amountPaid,
        remainingAmount,
      },
      subjects,
      upcomingExams,
      recentResults: results,
      feePayments,
      academicRecords,
    });
  } catch (error: any) {
    console.error('Student dashboard error:', error);
    return errorResponse('Failed to fetch student dashboard data');
  }
}
