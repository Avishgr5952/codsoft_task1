'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { DeptBarChart, AttendancePieChart, GradeBarChart } from '@/components/charts/DashboardCharts';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard/admin');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setData(json.data);
          }
        }
      } catch (e) {
        console.error('Failed to load admin dashboard:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading EduManage...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalAttendance: 0,
    pendingFees: 0,
    collectedFees: 0,
    upcomingExams: 0,
  };

  const statCards = [
    {
      title: 'Total Students',
      value: summary.totalStudents,
      subtitle: 'Active Enrollments',
      icon: Users,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 text-indigo-600',
      href: '/admin/students',
    },
    {
      title: 'Total Teachers',
      value: summary.totalTeachers,
      subtitle: 'Faculty Members',
      icon: GraduationCap,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-600',
      href: '/admin/teachers',
    },
    {
      title: 'Courses & Subjects',
      value: summary.totalSubjects,
      subtitle: 'Across Departments',
      icon: BookOpen,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-600',
      href: '/admin/subjects',
    },
    {
      title: 'Attendance Records',
      value: summary.totalAttendance,
      subtitle: 'Total Logs',
      icon: CalendarCheck,
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50 text-teal-600',
      href: '/admin/attendance',
    },
    {
      title: 'Pending Fees',
      value: `₹${Number(summary.pendingFees).toLocaleString()}`,
      subtitle: `Collected: ₹${Number(summary.collectedFees).toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50 text-rose-600',
      href: '/admin/fees',
    },
    {
      title: 'Upcoming Exams',
      value: summary.upcomingExams,
      subtitle: 'Scheduled this session',
      icon: FileSpreadsheet,
      color: 'bg-sky-500',
      lightColor: 'bg-sky-50 text-sky-600',
      href: '/admin/examinations',
    },
  ];

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Here is what is happening across EduManage academic administration today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/admin/students">
              <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4" />}>
                Add Student
              </Button>
            </Link>
            <Link href="/admin/attendance">
              <Button size="sm" variant="outline" icon={<CalendarCheck className="w-4 h-4" />}>
                Mark Attendance
              </Button>
            </Link>
            <Link href="/admin/examinations">
              <Button size="sm" variant="outline" icon={<FileSpreadsheet className="w-4 h-4" />}>
                New Exam
              </Button>
            </Link>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Card key={idx} className="relative overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {card.title}
                      </p>
                      {loading ? (
                        <Skeleton className="h-8 w-24 my-1" />
                      ) : (
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
                      )}
                      <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${card.lightColor} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <Link
                      href={card.href}
                      className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
                    >
                      View details
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <Card>
            <CardHeader
              title="Students by Department"
              subtitle="Enrolled active students distribution"
            />
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <DeptBarChart data={data?.studentByDept || []} />
              )}
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card>
            <CardHeader
              title="Attendance Overview"
              subtitle="Present, Absent, and Late records breakdown"
            />
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <AttendancePieChart data={data?.attendanceOverview || []} />
              )}
            </CardContent>
          </Card>

          {/* Exam Grade Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Academic Exam Performance"
              subtitle="Grade breakdown across examinations (A+, A, B, C, D, F)"
            />
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <GradeBarChart data={data?.gradeDistribution || []} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <Card>
            <CardHeader
              title="Recent Student Admissions"
              subtitle="Latest enrolled students in EduManage"
              action={
                <Link href="/admin/students" className="text-xs text-indigo-600 font-semibold hover:underline">
                  View All
                </Link>
              }
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-4 py-3">Dept</th>
                      <th className="px-4 py-3">Semester</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-4">
                          <Skeleton className="h-16 w-full" />
                        </td>
                      </tr>
                    ) : (data?.recentStudents || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 text-xs">
                          No recent students
                        </td>
                      </tr>
                    ) : (
                      data.recentStudents.map((st: any) => (
                        <tr key={st.id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-3 font-medium text-slate-900">
                            <div>{st.firstName} {st.lastName}</div>
                            <div className="text-xs text-slate-400">{st.studentId}</div>
                          </td>
                          <td className="px-4 py-3">{st.department.code}</td>
                          <td className="px-4 py-3">Sem {st.semester} - {st.section}</td>
                          <td className="px-5 py-3">
                            <Badge variant={st.status === 'Active' ? 'success' : 'secondary'} size="sm">
                              {st.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Fee Payments */}
          <Card>
            <CardHeader
              title="Recent Fee Transactions"
              subtitle="Latest fee payments logged"
              action={
                <Link href="/admin/fees" className="text-xs text-indigo-600 font-semibold hover:underline">
                  View All
                </Link>
              }
            />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Invoice</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Paid</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-4">
                          <Skeleton className="h-16 w-full" />
                        </td>
                      </tr>
                    ) : (data?.recentPayments || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 text-xs">
                          No recent fee transactions
                        </td>
                      </tr>
                    ) : (
                      data.recentPayments.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-3 font-mono text-xs text-indigo-600 font-semibold">
                            {p.invoiceNumber}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {p.student?.firstName} {p.student?.lastName}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            ₹{Number(p.amountPaid).toLocaleString()}
                          </td>
                          <td className="px-5 py-3">
                            <Badge
                              variant={
                                p.paymentStatus === 'PAID'
                                  ? 'success'
                                  : p.paymentStatus === 'PARTIAL'
                                  ? 'warning'
                                  : 'danger'
                              }
                              size="sm"
                            >
                              {p.paymentStatus}
                            </Badge>
                          </td>
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
