'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { AttendanceSheet } from '@/components/attendance/AttendanceSheet';

export default function TeacherAttendancePage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty Attendance Portal</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Mark daily attendance for students enrolled in your syllabus sections.
          </p>
        </div>

        <AttendanceSheet teacherFilterId={user.teacherId} />
      </div>
    </AppLayout>
  );
}
