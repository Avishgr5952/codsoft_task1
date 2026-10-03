import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    let studentId = searchParams.get('studentId');

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: { userId: user.id },
      });
      if (!student) return errorResponse('Student not found', 404);
      studentId = student.id;
    }

    if (!studentId) {
      return errorResponse('Student ID is required', 400);
    }

    const attendances = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        subject: { select: { id: true, code: true, name: true } },
      },
    });

    const total = attendances.length;
    const present = attendances.filter((a) => a.status === 'PRESENT').length;
    const late = attendances.filter((a) => a.status === 'LATE').length;
    const absent = attendances.filter((a) => a.status === 'ABSENT').length;
    const effectivePresent = present + late;
    const overallPercentage = total > 0 ? Math.round((effectivePresent / total) * 100 * 10) / 10 : 0;

    // Group by subject
    const subjectMap: Record<string, { code: string; name: string; total: number; present: number; absent: number; late: number }> = {};

    attendances.forEach((att) => {
      const sId = att.subject.id;
      if (!subjectMap[sId]) {
        subjectMap[sId] = {
          code: att.subject.code,
          name: att.subject.name,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        };
      }
      subjectMap[sId].total += 1;
      if (att.status === 'PRESENT') subjectMap[sId].present += 1;
      else if (att.status === 'LATE') subjectMap[sId].late += 1;
      else if (att.status === 'ABSENT') subjectMap[sId].absent += 1;
    });

    const bySubject = Object.values(subjectMap).map((item) => ({
      ...item,
      percentage: item.total > 0 ? Math.round(((item.present + item.late) / item.total) * 100 * 10) / 10 : 0,
    }));

    return successResponse({
      summary: {
        total,
        present,
        late,
        absent,
        overallPercentage,
      },
      bySubject,
    });
  } catch (error: any) {
    return errorResponse('Failed to fetch attendance statistics');
  }
}
