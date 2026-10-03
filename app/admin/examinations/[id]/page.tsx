'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Award,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { calculateGradeAndStatus } from '@/utils/grades';

export default function ExamGradingPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Marks map: studentId -> { marksObtained: number | string, remarks: string }
  const [marksMap, setMarksMap] = useState<
    Record<string, { marksObtained: string | number; remarks: string }>
  >({});

  const fetchExamDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/exams/${id}`);
      const json = await res.json();
      if (json.success) {
        setExam(json.data);

        // Prepopulate existing results
        const map: Record<string, { marksObtained: string | number; remarks: string }> = {};
        const eligible = json.data.eligibleStudents || [];
        const results = json.data.results || [];

        eligible.forEach((st: any) => {
          const matched = results.find((r: any) => r.studentId === st.id);
          if (matched) {
            map[st.id] = {
              marksObtained: matched.marksObtained,
              remarks: matched.remarks || '',
            };
          } else {
            map[st.id] = {
              marksObtained: '',
              remarks: '',
            };
          }
        });

        setMarksMap(map);
      }
    } catch (e) {
      toastError('Failed to load examination');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchExamDetail();
  }, [id]);

  const handleMarkChange = (studentId: string, val: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: val,
      },
    }));
  };

  const handleRemarkChange = (studentId: string, val: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: val,
      },
    }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const resultsToSave = Object.entries(marksMap)
        .filter(([_, v]) => v.marksObtained !== '' && !isNaN(Number(v.marksObtained)))
        .map(([studentId, v]) => ({
          studentId,
          marksObtained: Number(v.marksObtained),
          remarks: v.remarks,
        }));

      if (resultsToSave.length === 0) {
        toastError('Please enter marks for at least one student');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: id,
          results: resultsToSave,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save marks');

      success(json.message || 'Marks and grades evaluated successfully');
      fetchExamDetail();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  const maxMarks = exam?.maxMarks || 100;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href={user.role === 'ADMIN' ? '/admin/examinations' : '/teacher/marks'}>
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Examinations
            </Button>
          </Link>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : !exam ? (
          <Card className="text-center py-12">
            <h3 className="text-lg font-semibold text-slate-800">Examination Not Found</h3>
          </Card>
        ) : (
          <>
            {/* Header info */}
            <Card className="border-sky-100 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 font-mono text-xs font-semibold uppercase">
                      {exam.examCode}
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight mt-2">{exam.name}</h1>
                    <p className="text-slate-300 text-sm mt-1">
                      {exam.subject?.code} - {exam.subject?.name} &bull; {exam.department?.name} (Sem {exam.semester})
                    </p>
                  </div>

                  <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-700/80 pt-4 sm:pt-0 sm:pl-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Max Marks</p>
                      <p className="text-2xl font-bold text-sky-400 mt-0.5">{exam.maxMarks}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Pass Marks</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-0.5">{exam.passMarks}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grading Table */}
            <Card>
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                    <span>Student Evaluation & Marks Roster</span>
                  </div>
                }
                subtitle="Enter marks obtained out of maximum marks. Percentage and grades are calculated automatically."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSaveMarks}
                    isLoading={saving}
                  >
                    Save All Marks
                  </Button>
                }
              />
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                      <tr>
                        <th className="px-6 py-3.5">Student ID</th>
                        <th className="px-6 py-3.5">Student Name</th>
                        <th className="px-6 py-3.5 w-40">Marks (/{maxMarks})</th>
                        <th className="px-6 py-3.5">Percentage</th>
                        <th className="px-6 py-3.5">Grade</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Remarks / Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(exam.eligibleStudents || []).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                            No students currently enrolled in this department and semester.
                          </td>
                        </tr>
                      ) : (
                        exam.eligibleStudents.map((st: any) => {
                          const userVal = marksMap[st.id]?.marksObtained ?? '';
                          const isEntered = userVal !== '' && !isNaN(Number(userVal));
                          const numMarks = isEntered ? Number(userVal) : 0;
                          const { percentage, grade, status } = calculateGradeAndStatus(
                            numMarks,
                            maxMarks
                          );

                          return (
                            <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-6 py-4 font-mono font-semibold text-xs text-indigo-600">
                                {st.studentId}
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-900">
                                {st.firstName} {st.lastName}
                                <span className="text-xs text-slate-400 block">Sec {st.section}</span>
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  min={0}
                                  max={maxMarks}
                                  step="0.5"
                                  placeholder={`0 - ${maxMarks}`}
                                  value={userVal}
                                  onChange={(e) => handleMarkChange(st.id, e.target.value)}
                                  className="w-32 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </td>
                              <td className="px-6 py-4 font-semibold text-indigo-600">
                                {isEntered ? `${percentage}%` : '-'}
                              </td>
                              <td className="px-6 py-4">
                                {isEntered ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 font-bold text-indigo-700 text-xs">
                                    {grade}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {isEntered ? (
                                  <Badge variant={status === 'PASS' ? 'success' : 'danger'} size="sm">
                                    {status}
                                  </Badge>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  placeholder="Evaluator remarks..."
                                  value={marksMap[st.id]?.remarks || ''}
                                  onChange={(e) => handleRemarkChange(st.id, e.target.value)}
                                  className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
