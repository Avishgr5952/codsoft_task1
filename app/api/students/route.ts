import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { hashPassword } from '@/lib/jwt';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

// GET /api/students - List students with search, filters (department, semester, section, status)
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId');
    const semester = searchParams.get('semester');
    const section = searchParams.get('section');
    const status = searchParams.get('status');

    const students = await prisma.student.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { studentId: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          departmentId ? { departmentId } : {},
          semester ? { semester: parseInt(semester, 10) } : {},
          section ? { section } : {},
          status ? { status } : {},
        ],
      },
      include: {
        department: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(students);
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return errorResponse('Failed to fetch students');
  }
}

// POST /api/students - Create student (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const body = await req.json();
    const {
      studentId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      departmentId,
      course,
      semester = 1,
      section = 'A',
      admissionDate,
      profilePhoto,
      status = 'Active',
      password = 'Student@123',
    } = body;

    if (!studentId || !firstName || !lastName || !email || !departmentId || !course) {
      return errorResponse('Student ID, First Name, Last Name, Email, Department, and Course are required', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStudentId = studentId.trim().toUpperCase();

    // Check duplicate
    const [existingEmail, existingStudentId] = await Promise.all([
      prisma.user.findUnique({ where: { email: cleanEmail } }),
      prisma.student.findUnique({ where: { studentId: cleanStudentId } }),
    ]);

    if (existingEmail) {
      return errorResponse(`Email ${cleanEmail} is already registered`, 409);
    }
    if (existingStudentId) {
      return errorResponse(`Student ID ${cleanStudentId} already exists`, 409);
    }

    const hashedPassword = await hashPassword(password);

    const newStudent = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: cleanEmail,
          name: `${firstName.trim()} ${lastName.trim()}`,
          password: hashedPassword,
          role: 'STUDENT',
        },
      });

      const student = await tx.student.create({
        data: {
          studentId: cleanStudentId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: cleanEmail,
          phone: phone?.trim() || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || 'Male',
          address: address?.trim() || null,
          departmentId,
          course: course.trim(),
          semester: Number(semester) || 1,
          section: section.trim() || 'A',
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
          profilePhoto: profilePhoto?.trim() || null,
          status,
          userId: newUser.id,
        },
        include: {
          department: true,
        },
      });

      return student;
    });

    return successResponse(newStudent, 'Student created successfully', 201);
  } catch (error: any) {
    console.error('Error creating student:', error);
    return errorResponse(error.message || 'Failed to create student');
  }
}
