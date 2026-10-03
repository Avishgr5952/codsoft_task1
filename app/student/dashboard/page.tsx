'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Award,
  CreditCard,
  BookOpen,
  Calendar,
  Clock,
  ArrowUpRight,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      try {
        const res = await fetch('/api/dashboard/student');
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
    loadStudentData();
  }, []);

  if (authLoading || !user) return null;

  const student = data?.student;
  const metrics = data?.metrics || {
    attendancePercentage: 0,
    totalClasses: 0,
    presentClasses: 0,
    currentSemester: 1,
    totalFee: 0,
    amountPaid: 0,
    remainingAmount: 0,
  };

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
                {student?.firstName ? student.firstName.charAt(0) : 'S'}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome back, {student?.firstName} {student?.lastName}!
                </h1>
                <p className="text-sky-200 text-sm mt-0.5">
                  Student ID: <span className="font-mono font-medium">{student?.studentId}</span> &bull;{' '}
                  {student?.course}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Department of {student?.department?.name} &bull; Semester {student?.semester} - Section {student?.section}
                </p>
              </div>
            </div>

            <Link href="/student/profile">
              <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10" icon={<User className="w-4 h-4" />}>
                View Full Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Summary Dashboard Cards (Section 12) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Attendance Card */}
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Attendance</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  {metrics.attendancePercentage}%
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {metrics.presentClasses} of {metrics.totalClasses} classes attended
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* 2. Current Semester Card */}
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Current Semester</p>
                <h3 className="text-2xl font-bold text-indigo-600 mt-1">
                  Semester {metrics.currentSemester}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {(data?.subjects || []).length} registered subjects
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* 3. Pending Fees Card */}
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Pending Fees</p>
                <h3 className={`text-2xl font-bold mt-1 ${metrics.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹{Number(metrics.remainingAmount).toLocaleString()}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Paid: ₹{Number(metrics.amountPaid).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* 4. Latest Results Card */}
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Latest Results</p>
                <h3 className="text-2xl font-bold text-sky-600 mt-1">
                  {(data?.recentResults || []).length > 0
                    ? `Grade ${data.recentResults[0].grade}`
                    : 'N/A'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {(data?.recentResults || []).length} exam evaluations
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses & Upcoming Exams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Semester Subjects */}
          <Card>
            <CardHeader
              title="Registered Subjects"
              subtitle={`Courses enrolled in Semester ${student?.semester || 1}`}
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-5"><Skeleton className="h-28 w-full" /></div>
                ) : (data?.subjects || []).length === 0 ? (
                  <p className="p-8 text-center text-slate-400 text-sm">No subjects enrolled for this term.</p>
                ) : (
                  data.subjects.map((sub: any) => (
                    <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{sub.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Code: <span className="font-mono text-indigo-600 font-semibold">{sub.code}</span> &bull;{' '}
                          Instructor: {sub.teacher?.name || 'Faculty Member'}
                        </div>
                      </div>
                      <Badge variant="primary" size="sm">
                        {sub.credits} Credits
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exam Timetable */}
          <Card>
            <CardHeader
              title="Exam Timetable"
              subtitle="Upcoming scheduled examinations"
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-5"><Skeleton className="h-28 w-full" /></div>
                ) : (data?.upcomingExams || []).length === 0 ? (
                  <p className="p-8 text-center text-slate-400 text-sm">No upcoming exams scheduled.</p>
                ) : (
                  data.upcomingExams.map((exam: any) => (
                    <div key={exam.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{exam.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{exam.subject.code} - {exam.subject.name}</span> &bull;
                          <span>Max: {exam.maxMarks}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded">
                          {new Date(exam.examDate).toLocaleDateString()}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {exam.startTime}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Exam Results */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Academic Results & Performance"
              subtitle="Evaluated midterm and end-term examinations"
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                    <tr>
                      <th className="px-6 py-3.5">Exam</th>
                      <th className="px-6 py-3.5">Subject</th>
                      <th className="px-6 py-3.5">Marks Obtained</th>
                      <th className="px-6 py-3.5">Percentage</th>
                      <th className="px-6 py-3.5">Grade</th>
                      <th className="px-6 py-3.5">Result</th>
                      <th className="px-6 py-3.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan={7}><Skeleton className="h-16 w-full m-4" /></td></tr>
                    ) : (data?.recentResults || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                          No examination results published yet.
                        </td>
                      </tr>
                    ) : (
                      data.recentResults.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-4 font-semibold text-slate-900">{r.exam?.name}</td>
                          <td className="px-6 py-4 text-slate-700">
                            {r.exam?.subject?.code} - {r.exam?.subject?.name}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {r.marksObtained} / {r.maxMarks}
                          </td>
                          <td className="px-6 py-4 font-semibold text-indigo-600">{r.percentage}%</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 font-bold text-indigo-700 text-xs">
                              {r.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={r.status === 'PASS' ? 'success' : 'danger'} size="sm">
                              {r.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">{r.remarks || 'Normal evaluation'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
