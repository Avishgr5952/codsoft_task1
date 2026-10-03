'use client';

import { useState, useEffect } from 'react';
import { Award, BookOpen, CheckCircle2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StudentResultsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await fetch('/api/results');
        const json = await res.json();
        if (json.success) {
          setResults(json.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Examination Results & Grades</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified assessment scores, computed percentage, grade awards, and faculty remarks.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Exam Title</th>
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
                    <tr><td colSpan={7}><TableSkeleton rows={4} cols={7} /></td></tr>
                  ) : results.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12">
                        <EmptyState title="No results published" description="Your exam evaluation records have not been released yet." />
                      </td>
                    </tr>
                  ) : (
                    results.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-semibold text-slate-900">{r.exam?.name}</td>
                        <td className="px-6 py-4">{r.exam?.subject?.code} - {r.exam?.subject?.name}</td>
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
                        <td className="px-6 py-4 text-xs text-slate-500">{r.remarks || 'Standard grading'}</td>
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
