'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, CalendarCheck, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function TeacherSubjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch('/api/dashboard/teacher');
        const json = await res.json();
        if (json.success) {
          setSubjects(json.data.assignedSubjects || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assigned Curriculum Subjects</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Course modules under your instruction for the current semester.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-slate-200 animate-pulse" />)
          ) : subjects.length === 0 ? (
            <div className="col-span-full">
              <EmptyState title="No assigned subjects" description="You currently have no courses assigned to your profile." />
            </div>
          ) : (
            subjects.map((sub) => (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardHeader
                  title={
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold text-xs">
                        {sub.code}
                      </span>
                      <span className="truncate">{sub.name}</span>
                    </div>
                  }
                />
                <CardContent className="space-y-3 pt-3">
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Department: <strong className="text-slate-800">{sub.department?.name}</strong></p>
                    <p>Semester: <strong className="text-slate-800">Semester {sub.semester}</strong></p>
                    <p>Credits: <strong className="text-slate-800">{sub.credits} Academic Credits</strong></p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <Link href={`/teacher/attendance?subjectId=${sub.id}`}>
                      <Button size="sm" variant="primary" icon={<CalendarCheck className="w-3.5 h-3.5" />}>
                        Take Attendance
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
