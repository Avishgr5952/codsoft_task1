'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  ArrowUpRight,
  Plus,
  Clock,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function TeacherDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeacherData() {
      try {
        const res = await fetch('/api/dashboard/teacher');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchTeacherData();
  }, []);

  if (authLoading || !user) return null;

  const teacher = data?.teacher;
  const summary = data?.summary || {
    assignedSubjectsCount: 0,
    totalStudents: 0,
    upcomingExamsCount: 0,
  };

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome, {teacher?.name || user.name}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {teacher?.designation || 'Faculty Member'} &bull; {teacher?.department || 'Academic Department'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/teacher/attendance">
              <Button size="sm" variant="primary" icon={<CalendarCheck className="w-4 h-4" />}>
                Mark Today's Attendance
              </Button>
            </Link>
            <Link href="/teacher/marks">
              <Button size="sm" variant="outline" icon={<Award className="w-4 h-4" />}>
                Enter Exam Marks
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Taught Courses</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.assignedSubjectsCount}</h3>
                <p className="text-xs text-slate-400 mt-1">Assigned syllabus courses</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Enrolled Students</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{summary.totalStudents}</h3>
                <p className="text-xs text-slate-400 mt-1">In your department</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Upcoming Exams</p>
                <h3 className="text-2xl font-bold text-sky-600 mt-1">{summary.upcomingExamsCount}</h3>
                <p className="text-xs text-slate-400 mt-1">Pending assessment entry</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Subjects & Upcoming Exams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Courses */}
          <Card>
            <CardHeader
              title="Assigned Subjects"
              subtitle="Classes and course modules scheduled this semester"
              action={
                <Link href="/teacher/subjects" className="text-xs text-indigo-600 font-semibold hover:underline">
                  View All
                </Link>
              }
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-5"><Skeleton className="h-28 w-full" /></div>
                ) : (data?.assignedSubjects || []).length === 0 ? (
                  <p className="p-8 text-center text-slate-400 text-sm">No subjects assigned yet.</p>
                ) : (
                  data.assignedSubjects.map((sub: any) => (
                    <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-900">{sub.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Code: <span className="font-mono text-indigo-600 font-semibold">{sub.code}</span> &bull;{' '}
                          Semester {sub.semester}
                        </div>
                      </div>
                      <Link href={`/teacher/attendance?subjectId=${sub.id}`}>
                        <Button size="sm" variant="outline">
                          Mark Attendance
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Exams */}
          <Card>
            <CardHeader
              title="Examinations & Grading"
              subtitle="Tests requiring marks and grade submission"
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-5"><Skeleton className="h-28 w-full" /></div>
                ) : (data?.upcomingExams || []).length === 0 ? (
                  <p className="p-8 text-center text-slate-400 text-sm">No exams scheduled for your subjects.</p>
                ) : (
                  data.upcomingExams.map((exam: any) => (
                    <div key={exam.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-900">{exam.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {exam.subject.code} &bull; {new Date(exam.examDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Link href={`/admin/examinations/${exam.id}`}>
                        <Button size="sm" variant="primary" icon={<Award className="w-3.5 h-3.5" />}>
                          Enter Marks
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
