'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  GraduationCap,
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
import { SubjectItem, DepartmentItem, TeacherItem } from '@/types';

export default function SubjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    departmentId: '',
    semester: 1,
    credits: 3,
    teacherId: '',
  });

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedDept) query.append('departmentId', selectedDept);
      if (selectedSemester) query.append('semester', selectedSemester);

      const res = await fetch(`/api/subjects?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSubjects(json.data);
      }
    } catch (e) {
      toastError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [deptRes, tRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/teachers'),
      ]);
      const [deptJson, tJson] = await Promise.all([deptRes.json(), tRes.json()]);

      if (deptJson.success) {
        setDepartments(deptJson.data);
        if (deptJson.data.length > 0 && !formData.departmentId) {
          setFormData((prev) => ({ ...prev, departmentId: deptJson.data[0].id }));
        }
      }
      if (tJson.success) setTeachers(tJson.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [search, selectedDept, selectedSemester]);

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      departmentId: departments[0]?.id || '',
      semester: 1,
      credits: 3,
      teacherId: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (sub: SubjectItem) => {
    setSelectedSubject(sub);
    setFormData({
      code: sub.code,
      name: sub.name,
      departmentId: sub.departmentId,
      semester: sub.semester,
      credits: sub.credits,
      teacherId: sub.teacherId || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (sub: SubjectItem) => {
    setSelectedSubject(sub);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create subject');
      success('Subject created successfully');
      setIsAddOpen(false);
      fetchSubjects();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/subjects/${selectedSubject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update subject');
      success('Subject updated successfully');
      setIsEditOpen(false);
      fetchSubjects();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedSubject) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/subjects/${selectedSubject.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete subject');
      success('Subject deleted successfully');
      setIsDeleteOpen(false);
      fetchSubjects();
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Curriculum Subjects</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Configure course offerings, credits, semester alignment, and assigned instructors.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add Subject
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                placeholder="Search subject code or name..."
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

        {/* Subjects Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Subject Code</th>
                    <th className="px-6 py-3.5">Subject Name</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Semester</th>
                    <th className="px-6 py-3.5">Credits</th>
                    <th className="px-6 py-3.5">Instructor</th>
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
                  ) : subjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12">
                        <EmptyState
                          title="No subjects found"
                          description="Create syllabus subjects and assign them to departments and faculty."
                          action={
                            <Button size="sm" onClick={handleOpenAdd}>
                              Add New Subject
                            </Button>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-indigo-600">
                          {sub.code}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{sub.name}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold text-slate-700">
                            {sub.department?.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">Semester {sub.semester}</td>
                        <td className="px-6 py-4">
                          <Badge variant="primary" size="sm">
                            {sub.credits} Credits
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {sub.teacher ? (
                            <span className="text-slate-900 font-medium">{sub.teacher.name}</span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(sub)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(sub)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
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

        {/* Add Modal */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Subject"
          subtitle="Define syllabus title, credit rating, and instructor."
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Subject Code"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. BCA101"
              />
              <Input
                label="Subject Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Modern Web Development"
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
                label="Semester"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
              />
              <Input
                label="Credits"
                type="number"
                min={1}
                max={10}
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
              />
            </div>

            <Select
              label="Assigned Instructor (Optional)"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              placeholder="-- Select Faculty Member --"
              options={teachers.map((t) => ({ value: t.id, label: `${t.name} (${t.designation})` }))}
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Save Subject
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Subject"
          subtitle="Update syllabus parameters or reassign instructor."
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Subject Code"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
              <Input
                label="Subject Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                label="Semester"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
              />
              <Input
                label="Credits"
                type="number"
                min={1}
                max={10}
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
              />
            </div>

            <Select
              label="Assigned Instructor"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              placeholder="-- Select Faculty Member --"
              options={teachers.map((t) => ({ value: t.id, label: `${t.name} (${t.designation})` }))}
            />

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
          title="Delete Subject"
          message={`Are you sure you want to delete ${selectedSubject?.code} - ${selectedSubject?.name}?`}
        />
      </div>
    </AppLayout>
  );
}
