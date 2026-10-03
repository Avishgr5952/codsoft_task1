'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  CreditCard,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'exams' | 'fees' | 'academic'>('profile');

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/students/${id}`);
        const json = await res.json();
        if (json.success) {
          setStudent(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDetail();
  }, [id]);

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/admin/students">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Students
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        ) : !student ? (
          <Card className="text-center py-12">
            <h3 className="text-lg font-semibold text-slate-800">Student Not Found</h3>
            <p className="text-sm text-slate-500 mt-1">The requested student record does not exist.</p>
          </Card>
        ) : (
          <>
            {/* Header Hero Card */}
            <Card className="border-indigo-100 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white overflow-hidden shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-500/20 border-2 border-indigo-400/30 flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
                      {student.firstName.charAt(0)}
                      {student.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">
                          {student.firstName} {student.lastName}
                        </h1>
                        <Badge variant={student.status === 'Active' ? 'success' : 'secondary'} size="sm">
                          {student.status}
                        </Badge>
                      </div>
                      <p className="text-indigo-200 text-sm font-mono mt-0.5">{student.studentId}</p>
                      <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                        <span>{student.department?.name}</span> &bull;
                        <span>Semester {student.semester}</span> &bull;
                        <span>Section {student.section}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Highlight Metric */}
                  <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-slate-700/80 pt-4 sm:pt-0 sm:pl-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Attendance</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                        {student.attendancePercentage}%
                      </p>
                      <p className="text-[11px] text-slate-400">{student.totalClasses} classes recorded</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm gap-1 overflow-x-auto">
              {[
                { id: 'profile', label: 'Personal Information', icon: User },
                { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
                { id: 'exams', label: 'Exam Results', icon: FileSpreadsheet },
                { id: 'fees', label: 'Fee Payments', icon: CreditCard },
                { id: 'academic', label: 'Academic History', icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Profile Information */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader title="General Information" />
                  <CardContent className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Full Name</span>
                      <span className="font-semibold text-slate-900">{student.firstName} {student.lastName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Student ID</span>
                      <span className="font-mono font-medium text-indigo-600">{student.studentId}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium text-slate-800">{student.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Phone</span>
                      <span className="font-medium text-slate-800">{student.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Gender</span>
                      <span className="font-medium text-slate-800">{student.gender || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Date of Birth</span>
                      <span className="font-medium text-slate-800">
                        {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 text-sm">
                      <span className="text-slate-500">Address</span>
                      <span className="font-medium text-slate-800 text-right">{student.address || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader title="Academic Information" />
                  <CardContent className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Department</span>
                      <span className="font-semibold text-slate-900">{student.department?.name} ({student.department?.code})</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Course</span>
                      <span className="font-medium text-slate-800">{student.course}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Current Semester</span>
                      <span className="font-semibold text-slate-900">Semester {student.semester}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Section</span>
                      <span className="font-medium text-slate-800">Section {student.section}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                      <span className="text-slate-500">Admission Date</span>
                      <span className="font-medium text-slate-800">
                        {new Date(student.admissionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 text-sm">
                      <span className="text-slate-500">Enrollment Status</span>
                      <Badge variant={student.status === 'Active' ? 'success' : 'secondary'} size="sm">
                        {student.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab 2: Attendance */}
            {activeTab === 'attendance' && (
              <Card>
                <CardHeader
                  title="Attendance History"
                  subtitle={`Total Classes: ${student.attendances?.length || 0} | Attendance Rate: ${student.attendancePercentage}%`}
                />
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                        <tr>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Subject Code & Name</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(student.attendances || []).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-400 text-sm">
                              No attendance recorded yet
                            </td>
                          </tr>
                        ) : (
                          student.attendances.map((att: any) => (
                            <tr key={att.id} className="hover:bg-slate-50/70">
                              <td className="px-6 py-3.5 font-medium text-slate-900">
                                {new Date(att.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-3.5">
                                <span className="font-semibold text-slate-900">{att.subject.code}</span> - {att.subject.name}
                              </td>
                              <td className="px-6 py-3.5">
                                <Badge
                                  variant={
                                    att.status === 'PRESENT'
                                      ? 'success'
                                      : att.status === 'LATE'
                                      ? 'warning'
                                      : 'danger'
                                  }
                                  size="sm"
                                  dot
                                >
                                  {att.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-3.5 text-slate-500 text-xs">
                                {att.remarks || 'Regular class'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab 3: Exam Results */}
            {activeTab === 'exams' && (
              <Card>
                <CardHeader title="Examination Results & Grades" subtitle="Formal semester assessments" />
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                        <tr>
                          <th className="px-6 py-3">Exam</th>
                          <th className="px-6 py-3">Subject</th>
                          <th className="px-6 py-3">Marks</th>
                          <th className="px-6 py-3">Percentage</th>
                          <th className="px-6 py-3">Grade</th>
                          <th className="px-6 py-3">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(student.examResults || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400 text-sm">
                              No exam results recorded
                            </td>
                          </tr>
                        ) : (
                          student.examResults.map((res: any) => (
                            <tr key={res.id} className="hover:bg-slate-50/70">
                              <td className="px-6 py-3.5 font-semibold text-slate-900">
                                {res.exam.name}
                              </td>
                              <td className="px-6 py-3.5 text-slate-700">
                                {res.exam.subject.code} - {res.exam.subject.name}
                              </td>
                              <td className="px-6 py-3.5 font-bold text-slate-900">
                                {res.marksObtained} / {res.maxMarks}
                              </td>
                              <td className="px-6 py-3.5 text-indigo-600 font-semibold">
                                {res.percentage}%
                              </td>
                              <td className="px-6 py-3.5">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 font-bold text-indigo-700 text-xs">
                                  {res.grade}
                                </span>
                              </td>
                              <td className="px-6 py-3.5">
                                <Badge variant={res.status === 'PASS' ? 'success' : 'danger'} size="sm">
                                  {res.status}
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
            )}

            {/* Tab 4: Fees */}
            {activeTab === 'fees' && (
              <Card>
                <CardHeader title="Fee Invoices & Payments" subtitle="Academic fee tracking" />
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                        <tr>
                          <th className="px-6 py-3">Invoice #</th>
                          <th className="px-6 py-3">Academic Term</th>
                          <th className="px-6 py-3">Total Fee</th>
                          <th className="px-6 py-3">Amount Paid</th>
                          <th className="px-6 py-3">Remaining</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(student.feePayments || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400 text-sm">
                              No fee records found
                            </td>
                          </tr>
                        ) : (
                          student.feePayments.map((fee: any) => (
                            <tr key={fee.id} className="hover:bg-slate-50/70">
                              <td className="px-6 py-3.5 font-mono text-xs text-indigo-600 font-semibold">
                                {fee.invoiceNumber}
                              </td>
                              <td className="px-6 py-3.5 text-slate-700">
                                {fee.academicYear} (Sem {fee.semester})
                              </td>
                              <td className="px-6 py-3.5 font-semibold text-slate-900">
                                ₹{Number(fee.totalFee).toLocaleString()}
                              </td>
                              <td className="px-6 py-3.5 text-emerald-600 font-semibold">
                                ₹{Number(fee.amountPaid).toLocaleString()}
                              </td>
                              <td className="px-6 py-3.5 text-rose-600 font-semibold">
                                ₹{Number(fee.remainingAmount).toLocaleString()}
                              </td>
                              <td className="px-6 py-3.5">
                                <Badge
                                  variant={
                                    fee.paymentStatus === 'PAID'
                                      ? 'success'
                                      : fee.paymentStatus === 'PARTIAL'
                                      ? 'warning'
                                      : 'danger'
                                  }
                                  size="sm"
                                >
                                  {fee.paymentStatus}
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
            )}

            {/* Tab 5: Academic History */}
            {activeTab === 'academic' && (
              <Card>
                <CardHeader title="Cumulative Academic Records" subtitle="Term-by-term GPA and credit accumulation" />
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                        <tr>
                          <th className="px-6 py-3">Academic Year</th>
                          <th className="px-6 py-3">Semester</th>
                          <th className="px-6 py-3">Subjects / Credits</th>
                          <th className="px-6 py-3">GPA</th>
                          <th className="px-6 py-3">Overall Grade</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(student.academicRecords || []).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400 text-sm">
                              No cumulative records stored
                            </td>
                          </tr>
                        ) : (
                          student.academicRecords.map((rec: any) => (
                            <tr key={rec.id} className="hover:bg-slate-50/70">
                              <td className="px-6 py-3.5 font-medium text-slate-900">{rec.academicYear}</td>
                              <td className="px-6 py-3.5 text-slate-700">Semester {rec.semester}</td>
                              <td className="px-6 py-3.5 text-slate-700">
                                {rec.totalSubjects} Subjects / {rec.totalCredits} Credits
                              </td>
                              <td className="px-6 py-3.5 font-bold text-indigo-600 text-base">
                                {rec.gpa || 'N/A'}
                              </td>
                              <td className="px-6 py-3.5 font-semibold text-slate-800">
                                {rec.overallGrade || 'N/A'}
                              </td>
                              <td className="px-6 py-3.5">
                                <Badge variant="success" size="sm">
                                  {rec.status}
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
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
