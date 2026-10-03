import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

// GET /api/records - List academic records
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    let studentId = searchParams.get('studentId');
    const academicYear = searchParams.get('academicYear');
    const semester = searchParams.get('semester');

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { userId: user.id },
      });
      if (!student) return errorResponse('Student not found', 404);
      studentId = student.id;
    }

    const records = await prisma.academicRecord.findMany({
      where: {
        AND: [
          studentId ? { studentId } : {},
          academicYear ? { academicYear } : {},
          semester ? { semester: Number(semester) } : {},
        ],
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            course: true,
            department: { select: { code: true, name: true } },
          },
        },
      },
      orderBy: [{ studentId: 'asc' }, { semester: 'desc' }],
    });

    return successResponse(records);
  } catch (error: any) {
    return errorResponse('Failed to fetch academic records');
  }
}

// POST /api/records - Create or compute academic record
export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const body = await req.json();
    const {
      studentId,
      academicYear = '2024-2025',
      semester = 1,
      totalSubjects = 4,
      totalCredits = 16,
      gpa,
      cgpa,
      attendancePercentage,
      overallGrade,
      status = 'Completed',
    } = body;

    if (!studentId) {
      return errorResponse('Student ID is required', 400);
    }

    const record = await prisma.academicRecord.upsert({
      where: {
        studentId_academicYear_semester: {
          studentId,
          academicYear,
          semester: Number(semester) || 1,
        },
      },
      update: {
        totalSubjects: Number(totalSubjects) || 0,
        totalCredits: Number(totalCredits) || 0,
        gpa: gpa ? Number(gpa) : null,
        cgpa: cgpa ? Number(cgpa) : null,
        attendancePercentage: attendancePercentage ? Number(attendancePercentage) : null,
        overallGrade: overallGrade || null,
        status,
      },
      create: {
        studentId,
        academicYear,
        semester: Number(semester) || 1,
        totalSubjects: Number(totalSubjects) || 0,
        totalCredits: Number(totalCredits) || 0,
        gpa: gpa ? Number(gpa) : null,
        cgpa: cgpa ? Number(cgpa) : null,
        attendancePercentage: attendancePercentage ? Number(attendancePercentage) : null,
        overallGrade: overallGrade || null,
        status,
      },
      include: {
        student: true,
      },
    });

    return successResponse(record, 'Academic record saved successfully', 201);
  } catch (error: any) {
    console.error('Error saving academic record:', error);
    return errorResponse('Failed to save academic record');
  }
}
