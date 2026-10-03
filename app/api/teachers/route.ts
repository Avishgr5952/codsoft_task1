import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { hashPassword } from '@/lib/jwt';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

// GET /api/teachers - List teachers with search, department filter, and status filter
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');

    const teachers = await prisma.teacher.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                  { teacherId: { contains: search, mode: 'insensitive' } },
                  { designation: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          departmentId ? { departmentId } : {},
          status ? { status } : {},
        ],
      },
      include: {
        department: {
          select: { id: true, code: true, name: true },
        },
        subjects: {
          select: { id: true, code: true, name: true, semester: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(teachers);
  } catch (error: any) {
    console.error('Error fetching teachers:', error);
    return errorResponse('Failed to fetch teachers');
  }
}

// POST /api/teachers - Create teacher (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const body = await req.json();
    const {
      teacherId,
      name,
      email,
      phone,
      departmentId,
      designation,
      joiningDate,
      status = 'Active',
      password = 'Teacher@123',
      subjectIds = [],
    } = body;

    if (!teacherId || !name || !email || !departmentId) {
      return errorResponse('Teacher ID, Name, Email, and Department are required', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanTeacherId = teacherId.trim().toUpperCase();

    // Check duplicate email or teacher ID
    const [existingEmail, existingTeacherId] = await Promise.all([
      prisma.user.findUnique({ where: { email: cleanEmail } }),
      prisma.teacher.findUnique({ where: { teacherId: cleanTeacherId } }),
    ]);

    if (existingEmail) {
      return errorResponse(`Email ${cleanEmail} is already registered`, 409);
    }
    if (existingTeacherId) {
      return errorResponse(`Teacher ID ${cleanTeacherId} already exists`, 409);
    }

    const hashedPassword = await hashPassword(password);

    // Create User and Teacher inside a transaction
    const newTeacher = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: cleanEmail,
          name: name.trim(),
          password: hashedPassword,
          role: 'TEACHER',
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          teacherId: cleanTeacherId,
          name: name.trim(),
          email: cleanEmail,
          phone: phone?.trim() || null,
          designation: designation?.trim() || 'Assistant Professor',
          departmentId,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          status,
          userId: newUser.id,
        },
      });

      // Assign subjects if provided
      if (subjectIds.length > 0) {
        await tx.subject.updateMany({
          where: { id: { in: subjectIds } },
          data: { teacherId: teacher.id },
        });
      }

      return teacher;
    });

    return successResponse(newTeacher, 'Teacher created successfully', 201);
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    return errorResponse(error.message || 'Failed to create teacher');
  }
}
