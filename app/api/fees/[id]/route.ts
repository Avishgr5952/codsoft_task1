import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest, authorize } from '@/lib/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// PUT /api/fees/[id] - Record a payment or update fee record
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    const body = await req.json();
    const { amountPaid, paymentMethod, notes, paymentDate } = body;

    const existing = await prisma.feePayment.findUnique({
      where: { id: params.id },
    });

    if (!existing) return notFoundResponse('Fee record not found');

    const newAmountPaid = amountPaid !== undefined ? Number(amountPaid) : existing.amountPaid;
    const remainingAmount = Math.max(0, existing.totalFee - newAmountPaid);

    let paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
    if (newAmountPaid >= existing.totalFee && existing.totalFee > 0) {
      paymentStatus = 'PAID';
    } else if (newAmountPaid > 0) {
      paymentStatus = 'PARTIAL';
    }

    const updated = await prisma.feePayment.update({
      where: { id: params.id },
      data: {
        amountPaid: newAmountPaid,
        remainingAmount,
        paymentStatus,
        paymentMethod: paymentMethod || existing.paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes: notes !== undefined ? notes?.trim() : existing.notes,
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

    return successResponse(updated, 'Fee payment recorded successfully');
  } catch (error: any) {
    return errorResponse('Failed to update fee payment');
  }
}

// DELETE /api/fees/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();
    if (!authorize(user, ['ADMIN'])) return forbiddenResponse();

    await prisma.feePayment.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Fee payment record deleted successfully');
  } catch (error: any) {
    return errorResponse('Failed to delete fee record');
  }
}
