import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    // 1. Metric Counts
    const [
      totalStudents,
      totalTeachers,
      totalSubjects,
      totalDepartments,
      totalAttendance,
      feeStats,
      upcomingExams,
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'Active' } }),
      prisma.teacher.count({ where: { status: 'Active' } }),
      prisma.subject.count(),
      prisma.department.count(),
      prisma.attendance.count(),
      prisma.feePayment.aggregate({
        _sum: {
          totalFee: true,
          amountPaid: true,
          remainingAmount: true,
        },
      }),
      prisma.exam.count({
        where: {
          examDate: {
            gte: new Date(),
          },
        },
      }),
    ]);

    // 2. Students by Department
    const departments = await prisma.department.findMany({
      select: {
        code: true,
        name: true,
        _count: {
          select: { students: true },
        },
      },
    });

    const studentByDept = departments.map((d) => ({
      name: d.code,
      fullName: d.name,
      count: d._count.students,
    }));

    // 3. Attendance Overview
    const attendanceGroup = await prisma.attendance.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const attendanceOverview = attendanceGroup.map((item) => ({
      name: item.status,
      count: item._count._all,
    }));

    // 4. Fee Overview
    const feeStatusGroup = await prisma.feePayment.groupBy({
      by: ['paymentStatus'],
      _sum: {
        amountPaid: true,
        remainingAmount: true,
      },
      _count: {
        _all: true,
      },
    });

    // 5. Exam Performance (Grade Distribution)
    const gradeGroup = await prisma.examResult.groupBy({
      by: ['grade'],
      _count: {
        _all: true,
      },
    });

    const gradeDistribution = ['A+', 'A', 'B', 'C', 'D', 'F'].map((g) => {
      const match = gradeGroup.find((item) => item.grade === g);
      return {
        grade: g,
        count: match ? match._count._all : 0,
      };
    });

    // 6. Recent activities
    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { code: true } },
      },
    });

    const recentPayments = await prisma.feePayment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse({
      summary: {
        totalStudents,
        totalTeachers,
        totalSubjects,
        totalDepartments,
        totalAttendance,
        pendingFees: feeStats._sum.remainingAmount || 0,
        totalFees: feeStats._sum.totalFee || 0,
        collectedFees: feeStats._sum.amountPaid || 0,
        upcomingExams,
      },
      studentByDept,
      attendanceOverview,
      feeStatusGroup,
      gradeDistribution,
      recentStudents,
      recentPayments,
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return errorResponse('Failed to fetch dashboard metrics');
  }
}
