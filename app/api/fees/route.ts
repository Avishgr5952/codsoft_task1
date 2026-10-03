import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/api-response';

// GET /api/fees - List fee records with search and status filter
export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');
    let studentId = searchParams.get('studentId');

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { userId: user.id },
      });
      if (!student) return errorResponse('Student not found', 404);
      studentId = student.id;
    }

    const fees = await prisma.feePayment.findMany({
      where: {
        AND: [
          studentId ? { studentId } : {},
          status ? { paymentStatus: status as any } : {},
          search
            ? {
                OR: [
                  { invoiceNumber: { contains: search, mode: 'insensitive' } },
                  {
                    student: {
                      OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { studentId: { contains: search, mode: 'insensitive' } },
                      ],
                    },
                  },
                ],
              }
            : {},
          departmentId
            ? {
                student: { departmentId },
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
            department: { select: { code: true, name: true } },
          },
        },
        feeStructure: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute aggregates
    const totalFees = fees.reduce((sum, f) => sum + f.totalFee, 0);
    const totalCollected = fees.reduce((sum, f) => sum + f.amountPaid, 0);
    const totalPending = fees.reduce((sum, f) => sum + f.remainingAmount, 0);

    return successResponse({
      fees,
      stats: {
        totalFees,
        totalCollected,
        totalPending,
      },
    });
  } catch (error: any) {
    return errorResponse('Failed to fetch fee records');
  }
}

// POST /api/fees - Create/Assign fee payment record to student
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
      totalFee,
      amountPaid = 0,
      paymentMethod = 'Online',
      paymentDate,
      notes,
      feeStructureId,
    } = body;

    if (!studentId || totalFee === undefined || totalFee === null) {
      return errorResponse('Student ID and total fee are required', 400);
    }

    const numTotal = Number(totalFee);
    const numPaid = Number(amountPaid) || 0;
    const remainingAmount = Math.max(0, numTotal - numPaid);

    let paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
    if (numPaid >= numTotal && numTotal > 0) {
      paymentStatus = 'PAID';
    } else if (numPaid > 0) {
      paymentStatus = 'PARTIAL';
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const feeRecord = await prisma.feePayment.create({
      data: {
        invoiceNumber,
        studentId,
        feeStructureId: feeStructureId || null,
        academicYear,
        semester: Number(semester) || 1,
        totalFee: numTotal,
        amountPaid: numPaid,
        remainingAmount,
        paymentStatus,
        paymentMethod: numPaid > 0 ? paymentMethod : 'Pending',
        paymentDate: numPaid > 0 ? (paymentDate ? new Date(paymentDate) : new Date()) : null,
        notes: notes?.trim() || null,
      },
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

    return successResponse(feeRecord, 'Fee assigned successfully', 201);
  } catch (error: any) {
    console.error('Error assigning fee:', error);
    return errorResponse('Failed to assign fee');
  }
}
