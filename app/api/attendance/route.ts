import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

// GET /api/attendance
// Filter by studentId, subjectId, departmentId, semester, section, date
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');
    const departmentId = searchParams.get('departmentId');
    const semester = searchParams.get('semester');
    const section = searchParams.get('section');
    const date = searchParams.get('date');

    // If user is STUDENT, they can only view their own attendance
    let targetStudentId = studentId;
    if (user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { userId: user.id },
      });
      if (!student) return errorResponse('Student not found', 404);
      targetStudentId = student.id;
    }

    // Build date filter (same calendar day)
    let dateFilter = {};
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        AND: [
          targetStudentId ? { studentId: targetStudentId } : {},
          subjectId ? { subjectId } : {},
          dateFilter,
          departmentId || semester || section
            ? {
                student: {
                  AND: [
                    departmentId ? { departmentId } : {},
                    semester ? { semester: Number(semester) } : {},
                    section ? { section } : {},
                  ],
                },
              }
            : {},
        ],
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            semester: true,
            section: true,
          },
        },
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return successResponse(attendances);
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return errorResponse('Failed to fetch attendance');
  }
}

// POST /api/attendance - Mark attendance in bulk or single
// Prevents duplicates by upserting per Student + Subject + Date (normalized to midnight)
export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN', 'TEACHER'])) return forbiddenResponse();

    const body = await req.json();
    const { subjectId, date, records } = body;

    // records: Array<{ studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', remarks?: string }>
    if (!subjectId || !date || !Array.isArray(records) || records.length === 0) {
      return errorResponse('Subject, date, and student attendance records are required', 400);
    }

    // Normalize date to start of UTC day for strict matching
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // Identify teacher if teacher is marking
    let teacherId = null;
    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: user.teacherId ? { id: user.teacherId } : { email: user.email },
      });
      teacherId = teacher?.id || null;
    }

    // Process all attendance records in a single transaction with upsert
    const savedRecords = await prisma.$transaction(
      records.map((r: any) =>
        prisma.attendance.upsert({
          where: {
            studentId_subjectId_date: {
              studentId: r.studentId,
              subjectId,
              date: attendanceDate,
            },
          },
          update: {
            status: r.status,
            remarks: r.remarks || null,
            teacherId: teacherId || undefined,
          },
          create: {
            studentId: r.studentId,
            subjectId,
            date: attendanceDate,
            status: r.status,
            remarks: r.remarks || null,
            teacherId,
          },
        })
      )
    );

    return successResponse(
      savedRecords,
      `Successfully recorded attendance for ${savedRecords.length} students`
    );
  } catch (error: any) {
    console.error('Error recording attendance:', error);
    return errorResponse(error.message || 'Failed to record attendance');
  }
}
