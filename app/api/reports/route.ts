import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'students'; // students, attendance, exams, fees

    if (type === 'students') {
      const students = await prisma.student.findMany({
        include: {
          department: { select: { code: true, name: true } },
          _count: {
            select: { attendances: true, examResults: true, feePayments: true },
          },
        },
        orderBy: { studentId: 'asc' },
      });

      const formatted = students.map((s) => ({
        id: s.id,
        studentId: s.studentId,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        phone: s.phone || 'N/A',
        department: s.department.code,
        course: s.course,
        semester: s.semester,
        section: s.section,
        status: s.status,
        admissionDate: s.admissionDate.toISOString().split('T')[0],
      }));

      return successResponse({
        type: 'students',
        count: formatted.length,
        data: formatted,
      });
    }

    if (type === 'attendance') {
      const attendances = await prisma.attendance.findMany({
        include: {
          student: {
            select: {
              studentId: true,
              firstName: true,
              lastName: true,
              semester: true,
              section: true,
              department: { select: { code: true } },
            },
          },
          subject: { select: { code: true, name: true } },
        },
        orderBy: { date: 'desc' },
      });

      const formatted = attendances.map((a) => ({
        id: a.id,
        date: a.date.toISOString().split('T')[0],
        studentId: a.student.studentId,
        studentName: `${a.student.firstName} ${a.student.lastName}`,
        department: a.student.department.code,
        semester: a.student.semester,
        section: a.student.section,
        subjectCode: a.subject.code,
        subjectName: a.subject.name,
        status: a.status,
        remarks: a.remarks || '',
      }));

      return successResponse({
        type: 'attendance',
        count: formatted.length,
        data: formatted,
      });
    }

    if (type === 'exams') {
      const results = await prisma.examResult.findMany({
        include: {
          student: {
            select: {
              studentId: true,
              firstName: true,
              lastName: true,
              department: { select: { code: true } },
            },
          },
          exam: {
            include: {
              subject: { select: { code: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = results.map((r) => ({
        id: r.id,
        examCode: r.exam.examCode,
        examName: r.exam.name,
        subject: r.exam.subject.code,
        studentId: r.student.studentId,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        department: r.student.department.code,
        marksObtained: r.marksObtained,
        maxMarks: r.maxMarks,
        percentage: `${r.percentage}%`,
        grade: r.grade,
        status: r.status,
        remarks: r.remarks || '',
      }));

      return successResponse({
        type: 'exams',
        count: formatted.length,
        data: formatted,
      });
    }

    if (type === 'fees') {
      const fees = await prisma.feePayment.findMany({
        include: {
          student: {
            select: {
              studentId: true,
              firstName: true,
              lastName: true,
              department: { select: { code: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = fees.map((f) => ({
        id: f.id,
        invoiceNumber: f.invoiceNumber,
        studentId: f.student.studentId,
        studentName: `${f.student.firstName} ${f.student.lastName}`,
        department: f.student.department.code,
        academicYear: f.academicYear,
        semester: f.semester,
        totalFee: f.totalFee,
        amountPaid: f.amountPaid,
        remainingAmount: f.remainingAmount,
        paymentStatus: f.paymentStatus,
        paymentMethod: f.paymentMethod || 'N/A',
        paymentDate: f.paymentDate ? f.paymentDate.toISOString().split('T')[0] : 'N/A',
      }));

      return successResponse({
        type: 'fees',
        count: formatted.length,
        data: formatted,
      });
    }

    return errorResponse('Invalid report type');
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return errorResponse('Failed to generate report');
  }
}
