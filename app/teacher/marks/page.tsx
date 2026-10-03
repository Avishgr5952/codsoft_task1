'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, Award, Calendar, Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function TeacherMarksPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await fetch('/api/exams');
        const json = await res.json();
        if (json.success) {
          setExams(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Exam Evaluation</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Select an examination to record marks, compute grades, and generate student evaluation transcripts.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Exam Code</th>
                    <th className="px-6 py-3.5">Exam Title</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Max Marks</th>
                    <th className="px-6 py-3.5">Evaluated</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={7}><TableSkeleton rows={4} cols={7} /></td></tr>
                  ) : exams.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12">
                        <EmptyState title="No exams scheduled" description="No exams are pending grading." />
                      </td>
                    </tr>
                  ) : (
                    exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-sky-600">{exam.examCode}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{exam.name}</td>
                        <td className="px-6 py-4">{exam.subject?.code} - {exam.subject?.name}</td>
                        <td className="px-6 py-4 text-slate-600">{new Date(exam.examDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{exam.maxMarks}</td>
                        <td className="px-6 py-4">
                          <Badge variant="primary" size="sm">{exam._count?.results || 0} Graded</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/examinations/${exam.id}`}>
                            <Button size="sm" variant="primary" icon={<Award className="w-3.5 h-3.5" />}>
                              Grade Students
                            </Button>
                          </Link>
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
