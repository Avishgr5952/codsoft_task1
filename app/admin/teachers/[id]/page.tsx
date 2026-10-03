'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function TeacherDetailPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeacher() {
      try {
        const res = await fetch(`/api/teachers/${id}`);
        const json = await res.json();
        if (json.success) {
          setTeacher(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchTeacher();
  }, [id]);

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/teachers">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Teachers
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : !teacher ? (
          <Card className="text-center py-12">
            <h3 className="text-lg font-semibold text-slate-800">Faculty Record Not Found</h3>
          </Card>
        ) : (
          <>
            {/* Header Card */}
            <Card className="border-emerald-100 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white overflow-hidden shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/30 flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{teacher.name}</h1>
                        <Badge variant={teacher.status === 'Active' ? 'success' : 'secondary'} size="sm">
                          {teacher.status}
                        </Badge>
                      </div>
                      <p className="text-emerald-300 text-sm font-mono mt-0.5">{teacher.teacherId}</p>
                      <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                        <span>{teacher.designation}</span> &bull;
                        <span>{teacher.department?.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t sm:border-t-0 sm:border-l border-slate-700/80 pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Assigned Subjects</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                      {(teacher.subjects || []).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile details */}
              <Card>
                <CardHeader title="Faculty Information" />
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Teacher ID</span>
                    <span className="font-mono font-medium text-emerald-600">{teacher.teacherId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Official Email</span>
                    <span className="font-medium text-slate-900">{teacher.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium text-slate-900">{teacher.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Department</span>
                    <span className="font-medium text-slate-900">{teacher.department?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Designation</span>
                    <span className="font-medium text-slate-900">{teacher.designation}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-slate-500">Joining Date</span>
                    <span className="font-medium text-slate-900">
                      {new Date(teacher.joiningDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Subjects */}
              <Card>
                <CardHeader
                  title="Allocated Subjects"
                  subtitle={`Courses taught by ${teacher.name}`}
                />
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {(teacher.subjects || []).length === 0 ? (
                      <p className="p-6 text-sm text-slate-400 text-center">No subjects currently assigned</p>
                    ) : (
                      teacher.subjects.map((sub: any) => (
                        <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{sub.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Code: <span className="font-mono text-emerald-600 font-semibold">{sub.code}</span> &bull;
                              Semester {sub.semester}
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

              {/* Recent Marked Attendance */}
              <Card className="md:col-span-2">
                <CardHeader
                  title="Recent Attendance Marked by Faculty"
                  subtitle="Latest class sessions conducted"
                />
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-600">
                        <tr>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Subject</th>
                          <th className="px-6 py-3">Student</th>
                          <th className="px-6 py-3">Recorded Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(teacher.attendancesMarked || []).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-400 text-sm">
                              No attendance sessions marked yet
                            </td>
                          </tr>
                        ) : (
                          teacher.attendancesMarked.map((att: any) => (
                            <tr key={att.id} className="hover:bg-slate-50/70">
                              <td className="px-6 py-3 font-medium text-slate-900">
                                {new Date(att.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-3">
                                {att.subject.code} - {att.subject.name}
                              </td>
                              <td className="px-6 py-3">
                                {att.student.firstName} {att.student.lastName} ({att.student.studentId})
                              </td>
                              <td className="px-6 py-3">
                                <Badge
                                  variant={
                                    att.status === 'PRESENT'
                                      ? 'success'
                                      : att.status === 'LATE'
                                      ? 'warning'
                                      : 'danger'
                                  }
                                  size="sm"
                                >
                                  {att.status}
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
          </>
        )}
      </div>
    </AppLayout>
  );
}
