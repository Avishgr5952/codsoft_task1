'use client';

import { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  BookOpen,
  Calendar,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { StudentItem } from '@/types';

export default function AcademicRecordsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSemester, setSelectedSemester] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState({
    studentId: '',
    academicYear: '2024-2025',
    semester: 1,
    totalSubjects: 4,
    totalCredits: 16,
    gpa: 8.5,
    cgpa: 8.5,
    attendancePercentage: 85.0,
    overallGrade: 'A',
    status: 'Completed',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedSemester) query.append('semester', selectedSemester);

      const res = await fetch(`/api/records?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data);
      }
    } catch (e) {
      toastError('Failed to fetch academic records');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
        if (json.data.length > 0) {
          setForm((prev) => ({ ...prev, studentId: json.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedSemester]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save record');
      success('Academic record stored successfully');
      setIsAddOpen(false);
      fetchRecords();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Transcript Records</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Semester-wise GPA, credit accumulation, attendance ratings, and academic completion status.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddOpen(true)}
          >
            Add Academic Record
          </Button>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="w-full max-w-xs">
              <Select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                placeholder="All Semesters"
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Student ID & Name</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Year & Term</th>
                    <th className="px-6 py-3.5">Subjects & Credits</th>
                    <th className="px-6 py-3.5">Semester GPA</th>
                    <th className="px-6 py-3.5">Cumulative CGPA</th>
                    <th className="px-6 py-3.5">Overall Grade</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8}>
                        <TableSkeleton rows={5} cols={8} />
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12">
                        <EmptyState
                          title="No academic records stored"
                          description="Add term completion transcripts and calculate GPA / CGPA."
                          action={
                            <Button size="sm" onClick={() => setIsAddOpen(true)}>
                              Record Term Transcript
                            </Button>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900 block">
                            {rec.student?.firstName} {rec.student?.lastName}
                          </span>
                          <span className="font-mono text-xs text-indigo-600">
                            {rec.student?.studentId}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {rec.student?.department?.code || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {rec.academicYear} (Sem {rec.semester})
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">{rec.totalSubjects}</span> Courses &bull;{' '}
                          <span className="font-semibold text-slate-900">{rec.totalCredits}</span> Credits
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600 text-base">
                          {rec.gpa !== null ? rec.gpa : '-'}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 text-base">
                          {rec.cgpa !== null ? rec.cgpa : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 font-bold text-indigo-700 text-xs">
                            {rec.overallGrade || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
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

        {/* Add Modal */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create Academic Term Record"
          subtitle="Record official transcript results for a student term."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Student"
              required
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.studentId} - ${s.firstName} ${s.lastName}`,
              }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Academic Year"
                required
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                placeholder="2024-2025"
              />
              <Select
                label="Semester"
                required
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Courses"
                type="number"
                value={form.totalSubjects}
                onChange={(e) => setForm({ ...form, totalSubjects: Number(e.target.value) })}
              />
              <Input
                label="Total Credits"
                type="number"
                value={form.totalCredits}
                onChange={(e) => setForm({ ...form, totalCredits: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="GPA (0 - 10)"
                type="number"
                step="0.01"
                value={form.gpa}
                onChange={(e) => setForm({ ...form, gpa: Number(e.target.value) })}
              />
              <Input
                label="CGPA (0 - 10)"
                type="number"
                step="0.01"
                value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: Number(e.target.value) })}
              />
              <Select
                label="Overall Grade"
                value={form.overallGrade}
                onChange={(e) => setForm({ ...form, overallGrade: e.target.value })}
                options={['A+', 'A', 'B', 'C', 'D', 'F'].map((g) => ({ value: g, label: `Grade ${g}` }))}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Save Academic Record
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
