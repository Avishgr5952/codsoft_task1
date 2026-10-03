import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

// GET all departments
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const departments = await prisma.department.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
            subjects: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return successResponse(departments);
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return errorResponse('Failed to fetch departments');
  }
}

// POST create department (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const body = await req.json();
    const { code, name, description } = body;

    if (!code || !name) {
      return errorResponse('Department code and name are required', 400);
    }

    const cleanCode = code.trim().toUpperCase();

    // Check existing
    const existing = await prisma.department.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return errorResponse(`Department with code ${cleanCode} already exists`, 409);
    }

    const department = await prisma.department.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return successResponse(department, 'Department created successfully', 201);
  } catch (error: any) {
    console.error('Error creating department:', error);
    return errorResponse('Failed to create department');
  }
}
