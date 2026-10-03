'use client';

import { useState, useEffect } from 'react';
import { Award, BookOpen, CheckCircle2, History } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StudentRecordsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecords() {
      try {
        const res = await fetch('/api/records');
        const json = await res.json();
        if (json.success) {
          setRecords(json.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, []);

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic History & Transcripts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Semester-by-semester GPA performance, credits acquired, and official academic standing.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Academic Year</th>
                    <th className="px-6 py-3.5">Semester</th>
                    <th className="px-6 py-3.5">Subjects & Credits</th>
                    <th className="px-6 py-3.5">Semester GPA</th>
                    <th className="px-6 py-3.5">Cumulative CGPA</th>
                    <th className="px-6 py-3.5">Attendance Rate</th>
                    <th className="px-6 py-3.5">Overall Grade</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={8}><TableSkeleton rows={3} cols={8} /></td></tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12">
                        <EmptyState title="No transcript history" description="Academic transcript records will appear here as terms complete." />
                      </td>
                    </tr>
                  ) : (
                    records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-semibold text-slate-900">{rec.academicYear}</td>
                        <td className="px-6 py-4 text-slate-700">Semester {rec.semester}</td>
                        <td className="px-6 py-4 text-slate-700">
                          {rec.totalSubjects} Subjects / {rec.totalCredits} Credits
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600 text-base">{rec.gpa || '-'}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600 text-base">{rec.cgpa || '-'}</td>
                        <td className="px-6 py-4 text-slate-700">{rec.attendancePercentage ? `${rec.attendancePercentage}%` : '-'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 font-bold text-indigo-700 text-xs">
                            {rec.overallGrade || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="success" size="sm">{rec.status}</Badge>
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
    </AppLayout>
  );
}
