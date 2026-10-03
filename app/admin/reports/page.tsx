'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  CreditCard,
  Search,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { convertToCSV, downloadCSV } from '@/utils/exportCsv';

export default function ReportsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'exams' | 'fees'>('students');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async (type: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?type=${type}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(activeTab);
  }, [activeTab]);

  const handleExportCSV = () => {
    let headers: { key: string; label: string }[] = [];

    if (activeTab === 'students') {
      headers = [
        { key: 'studentId', label: 'Student ID' },
        { key: 'name', label: 'Student Name' },
        { key: 'email', label: 'Email Address' },
        { key: 'department', label: 'Department' },
        { key: 'course', label: 'Course Program' },
        { key: 'semester', label: 'Semester' },
        { key: 'section', label: 'Section' },
        { key: 'status', label: 'Status' },
        { key: 'admissionDate', label: 'Admission Date' },
      ];
    } else if (activeTab === 'attendance') {
      headers = [
        { key: 'date', label: 'Class Date' },
        { key: 'studentId', label: 'Student ID' },
        { key: 'studentName', label: 'Student Name' },
        { key: 'department', label: 'Department' },
        { key: 'subjectCode', label: 'Subject Code' },
        { key: 'subjectName', label: 'Subject Name' },
        { key: 'status', label: 'Attendance Status' },
        { key: 'remarks', label: 'Remarks' },
      ];
    } else if (activeTab === 'exams') {
      headers = [
        { key: 'examCode', label: 'Exam Code' },
        { key: 'examName', label: 'Exam Name' },
        { key: 'subject', label: 'Subject' },
        { key: 'studentId', label: 'Student ID' },
        { key: 'studentName', label: 'Student Name' },
        { key: 'department', label: 'Department' },
        { key: 'marksObtained', label: 'Marks' },
        { key: 'maxMarks', label: 'Max Marks' },
        { key: 'percentage', label: 'Percentage' },
        { key: 'grade', label: 'Grade' },
        { key: 'status', label: 'Result Status' },
      ];
    } else if (activeTab === 'fees') {
      headers = [
        { key: 'invoiceNumber', label: 'Invoice No.' },
        { key: 'studentId', label: 'Student ID' },
        { key: 'studentName', label: 'Student Name' },
        { key: 'department', label: 'Department' },
        { key: 'academicYear', label: 'Academic Year' },
        { key: 'semester', label: 'Semester' },
        { key: 'totalFee', label: 'Total Assessed' },
        { key: 'amountPaid', label: 'Amount Paid' },
        { key: 'remainingAmount', label: 'Balance Due' },
        { key: 'paymentStatus', label: 'Payment Status' },
      ];
    }

    const csv = convertToCSV(data, headers);
    downloadCSV(csv, `edumanage_${activeTab}_report_${new Date().toISOString().split('T')[0]}`);
  };

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Institutional Reports & Audits</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Comprehensive downloadable reporting matrices for students, attendance, examinations, and fee collections.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
            disabled={data.length === 0}
          >
            Export Report as CSV
          </Button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm gap-1 overflow-x-auto">
          {[
            { id: 'students', label: 'Student Enrollment Report', icon: Users },
            { id: 'attendance', label: 'Attendance Audit Report', icon: CalendarCheck },
            { id: 'exams', label: 'Exam Performance Report', icon: FileSpreadsheet },
            { id: 'fees', label: 'Fee Collection Report', icon: CreditCard },
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

        {/* Data Table */}
        <Card>
          <CardHeader
            title={
              <span className="capitalize font-semibold text-slate-900">
                {activeTab} Report Matrix ({data.length} records)
              </span>
            }
          />
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left text-sm">
                {activeTab === 'students' && (
                  <>
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600 sticky top-0">
                      <tr>
                        <th className="px-6 py-3.5">Student ID</th>
                        <th className="px-6 py-3.5">Name</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="px-6 py-3.5">Dept</th>
                        <th className="px-6 py-3.5">Semester & Sec</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan={6}><TableSkeleton rows={6} cols={6} /></td></tr>
                      ) : data.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-3.5 font-mono text-xs text-indigo-600 font-semibold">{s.studentId}</td>
                          <td className="px-6 py-3.5 font-semibold text-slate-900">{s.name}</td>
                          <td className="px-6 py-3.5 text-slate-600">{s.email}</td>
                          <td className="px-6 py-3.5 font-medium text-slate-800">{s.department}</td>
                          <td className="px-6 py-3.5 text-slate-700">Sem {s.semester} - {s.section}</td>
                          <td className="px-6 py-3.5"><Badge variant={s.status === 'Active' ? 'success' : 'secondary'} size="sm">{s.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {activeTab === 'attendance' && (
                  <>
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600 sticky top-0">
                      <tr>
                        <th className="px-6 py-3.5">Date</th>
                        <th className="px-6 py-3.5">Student ID & Name</th>
                        <th className="px-6 py-3.5">Department</th>
                        <th className="px-6 py-3.5">Subject</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan={6}><TableSkeleton rows={6} cols={6} /></td></tr>
                      ) : data.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-3.5 font-medium text-slate-900">{a.date}</td>
                          <td className="px-6 py-3.5">
                            <span className="font-semibold text-slate-900">{a.studentName}</span>
                            <span className="text-xs text-slate-400 block font-mono">{a.studentId}</span>
                          </td>
                          <td className="px-6 py-3.5 font-medium text-slate-700">{a.department}</td>
                          <td className="px-6 py-3.5 text-slate-700">{a.subjectCode} - {a.subjectName}</td>
                          <td className="px-6 py-3.5">
                            <Badge variant={a.status === 'PRESENT' ? 'success' : a.status === 'LATE' ? 'warning' : 'danger'} size="sm" dot>
                              {a.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-3.5 text-xs text-slate-500">{a.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {activeTab === 'exams' && (
                  <>
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600 sticky top-0">
                      <tr>
                        <th className="px-6 py-3.5">Exam Code</th>
                        <th className="px-6 py-3.5">Subject</th>
                        <th className="px-6 py-3.5">Student</th>
                        <th className="px-6 py-3.5">Marks Obtained</th>
                        <th className="px-6 py-3.5">Percentage</th>
                        <th className="px-6 py-3.5">Grade</th>
                        <th className="px-6 py-3.5">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan={7}><TableSkeleton rows={6} cols={7} /></td></tr>
                      ) : data.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-3.5 font-mono text-xs text-indigo-600 font-semibold">{r.examCode}</td>
                          <td className="px-6 py-3.5 text-slate-700">{r.subject}</td>
                          <td className="px-6 py-3.5 font-semibold text-slate-900">{r.studentName} ({r.studentId})</td>
                          <td className="px-6 py-3.5 font-bold text-slate-900">{r.marksObtained} / {r.maxMarks}</td>
                          <td className="px-6 py-3.5 font-semibold text-indigo-600">{r.percentage}</td>
                          <td className="px-6 py-3.5 font-bold text-indigo-700">{r.grade}</td>
                          <td className="px-6 py-3.5"><Badge variant={r.status === 'PASS' ? 'success' : 'danger'} size="sm">{r.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {activeTab === 'fees' && (
                  <>
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600 sticky top-0">
                      <tr>
                        <th className="px-6 py-3.5">Invoice #</th>
                        <th className="px-6 py-3.5">Student</th>
                        <th className="px-6 py-3.5">Academic Term</th>
                        <th className="px-6 py-3.5">Total Fee</th>
                        <th className="px-6 py-3.5">Amount Paid</th>
                        <th className="px-6 py-3.5">Balance</th>
                        <th className="px-6 py-3.5">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr><td colSpan={7}><TableSkeleton rows={6} cols={7} /></td></tr>
                      ) : data.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-3.5 font-mono text-xs text-indigo-600 font-semibold">{f.invoiceNumber}</td>
                          <td className="px-6 py-3.5 font-semibold text-slate-900">{f.studentName} ({f.studentId})</td>
                          <td className="px-6 py-3.5 text-slate-700">{f.academicYear} - Sem {f.semester}</td>
                          <td className="px-6 py-3.5 font-semibold text-slate-900">₹{Number(f.totalFee).toLocaleString()}</td>
                          <td className="px-6 py-3.5 font-semibold text-emerald-600">₹{Number(f.amountPaid).toLocaleString()}</td>
                          <td className="px-6 py-3.5 font-semibold text-rose-600">₹{Number(f.remainingAmount).toLocaleString()}</td>
                          <td className="px-6 py-3.5">
                            <Badge variant={f.paymentStatus === 'PAID' ? 'success' : f.paymentStatus === 'PARTIAL' ? 'warning' : 'danger'} size="sm">
                              {f.paymentStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
