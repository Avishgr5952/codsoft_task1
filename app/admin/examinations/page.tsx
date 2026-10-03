'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Award,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { ExamItem, DepartmentItem, SubjectItem } from '@/types';

export default function ExaminationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    examCode: '',
    name: '',
    departmentId: '',
    subjectId: '',
    semester: 1,
    examDate: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    durationMinutes: 180,
    maxMarks: 100,
    passMarks: 40,
  });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedDept) query.append('departmentId', selectedDept);
      if (selectedSemester) query.append('semester', selectedSemester);

      const res = await fetch(`/api/exams?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setExams(json.data);
      }
    } catch (e) {
      toastError('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [deptRes, subRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/subjects'),
      ]);
      const [deptJson, subJson] = await Promise.all([deptRes.json(), subRes.json()]);

      if (deptJson.success) {
        setDepartments(deptJson.data);
        if (deptJson.data.length > 0 && !formData.departmentId) {
          setFormData((prev) => ({ ...prev, departmentId: deptJson.data[0].id }));
        }
      }
      if (subJson.success) {
        setSubjects(subJson.data);
        if (subJson.data.length > 0 && !formData.subjectId) {
          setFormData((prev) => ({ ...prev, subjectId: subJson.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [search, selectedDept, selectedSemester]);

  const resetForm = () => {
    setFormData({
      examCode: `EXAM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      departmentId: departments[0]?.id || '',
      subjectId: subjects[0]?.id || '',
      semester: 1,
      examDate: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      durationMinutes: 180,
      maxMarks: 100,
      passMarks: 40,
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (exam: ExamItem) => {
    setSelectedExam(exam);
    setFormData({
      examCode: exam.examCode,
      name: exam.name,
      departmentId: exam.departmentId,
      subjectId: exam.subjectId,
      semester: exam.semester,
      examDate: exam.examDate ? exam.examDate.split('T')[0] : '',
      startTime: exam.startTime || '10:00 AM',
      durationMinutes: exam.durationMinutes,
      maxMarks: exam.maxMarks,
      passMarks: exam.passMarks,
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (exam: ExamItem) => {
    setSelectedExam(exam);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create exam');
      success('Examination created successfully');
      setIsAddOpen(false);
      fetchExams();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/exams/${selectedExam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update exam');
      success('Exam updated successfully');
      setIsEditOpen(false);
      fetchExams();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedExam) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/exams/${selectedExam.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete exam');
      success('Exam and associated result records deleted');
      setIsDeleteOpen(false);
      fetchExams();
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Examinations & Assessments</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Schedule midterm and end-term exams, configure total marks, and evaluate results.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Schedule Exam
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                placeholder="Search exam code or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
              <Select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                placeholder="All Departments"
                options={departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              />
              <Select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                placeholder="All Semesters"
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Exams Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Exam Code</th>
                    <th className="px-6 py-3.5">Exam Title</th>
                    <th className="px-6 py-3.5">Subject & Dept</th>
                    <th className="px-6 py-3.5">Date & Time</th>
                    <th className="px-6 py-3.5">Max / Pass</th>
                    <th className="px-6 py-3.5">Graded</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7}>
                        <TableSkeleton rows={5} cols={7} />
                      </td>
                    </tr>
                  ) : exams.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12">
                        <EmptyState
                          title="No examinations found"
                          description="Schedule an exam to begin recording student marks and grade evaluations."
                          action={
                            <Button size="sm" onClick={handleOpenAdd}>
                              Schedule First Exam
                            </Button>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-sky-600">
                          {exam.examCode}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{exam.name}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">{exam.subject?.code}</span>
                          <span className="text-xs text-slate-500 block">
                            {exam.department?.code} &bull; Sem {exam.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          <div>{new Date(exam.examDate).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-400">{exam.startTime} ({exam.durationMinutes} mins)</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">{exam.maxMarks}</span>
                          <span className="text-xs text-slate-400 ml-1">/ Pass: {exam.passMarks}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="primary" size="sm">
                            {exam._count?.results || 0} Graded
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/examinations/${exam.id}`}>
                              <Button variant="outline" size="sm" icon={<Award className="w-3.5 h-3.5" />}>
                                Marks & Grades
                              </Button>
                            </Link>
                            <button
                              onClick={() => handleOpenEdit(exam)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(exam)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Exam Modal */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Schedule New Examination"
          subtitle="Define assessment date, subject, and evaluation criteria."
          maxWidth="2xl"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Exam Code"
                required
                value={formData.examCode}
                onChange={(e) => setFormData({ ...formData, examCode: e.target.value.toUpperCase() })}
                placeholder="EXAM-2024-SEM1-BCA"
              />
              <Input
                label="Exam Title"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mid-Term Theory Exam 2024"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Department"
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                options={departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              />
              <Select
                label="Subject"
                required
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                options={subjects.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
              />
              <Select
                label="Semester"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Exam Date"
                type="date"
                required
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              />
              <Input
                label="Start Time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="10:00 AM"
              />
              <Input
                label="Duration (Minutes)"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Maximum Marks"
                type="number"
                required
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
              />
              <Input
                label="Passing Marks"
                type="number"
                required
                value={formData.passMarks}
                onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Schedule Exam
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Examination"
          subtitle="Update exam date, timing, or maximum marks."
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Exam Title"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Exam Date"
                type="date"
                required
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              />
              <Input
                label="Start Time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Maximum Marks"
                type="number"
                required
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
              />
              <Input
                label="Passing Marks"
                type="number"
                required
                value={formData.passMarks}
                onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteSubmit}
          isLoading={submitting}
          title="Delete Examination"
          message={`Are you sure you want to delete ${selectedExam?.name} (${selectedExam?.examCode})? All student marks evaluated for this exam will also be deleted.`}
        />
      </div>
    </AppLayout>
  );
}
