'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Plus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
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
import { TeacherItem, DepartmentItem, SubjectItem } from '@/types';

export default function TeachersManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    teacherId: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: 'Assistant Professor',
    status: 'Active',
    password: 'Teacher@123',
    subjectIds: [] as string[],
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedDept) query.append('departmentId', selectedDept);

      const res = await fetch(`/api/teachers?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setTeachers(json.data);
      }
    } catch (e) {
      toastError('Failed to fetch teachers');
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

      if (deptJson.success) setDepartments(deptJson.data);
      if (subJson.success) setAllSubjects(subJson.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [search, selectedDept]);

  const resetForm = () => {
    setFormData({
      teacherId: `TCH-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      designation: 'Assistant Professor',
      status: 'Active',
      password: 'Teacher@123',
      subjectIds: [],
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (teacher: TeacherItem) => {
    setSelectedTeacher(teacher);
    setFormData({
      teacherId: teacher.teacherId,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      departmentId: teacher.departmentId,
      designation: teacher.designation,
      status: teacher.status,
      password: '',
      subjectIds: (teacher.subjects || []).map((s) => s.id),
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (teacher: TeacherItem) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add teacher');
      success('Faculty member added successfully');
      setIsAddModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/teachers/${selectedTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update teacher');
      success('Faculty member updated successfully');
      setIsEditModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedTeacher) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/teachers/${selectedTeacher.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete teacher');
      success('Faculty member deleted successfully');
      setIsDeleteModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubjectSelection = (subjectId: string) => {
    setFormData((prev) => {
      const exists = prev.subjectIds.includes(subjectId);
      return {
        ...prev,
        subjectIds: exists
          ? prev.subjectIds.filter((id) => id !== subjectId)
          : [...prev.subjectIds, subjectId],
      };
    });
  };

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage professors, lecturers, departmental assignments, and subject mappings.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add Teacher
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  placeholder="Search faculty by name, ID, email, or designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <div>
                <Select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  placeholder="All Departments"
                  options={departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Teacher ID</th>
                    <th className="px-6 py-3.5">Name & Email</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Designation</th>
                    <th className="px-6 py-3.5">Subjects</th>
                    <th className="px-6 py-3.5">Status</th>
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
                  ) : teachers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12">
                        <EmptyState
                          title="No teachers found"
                          description="Add faculty members to assign them to courses and track attendance."
                          action={
                            <Button size="sm" onClick={handleOpenAdd}>
                              Add Faculty Member
                            </Button>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    teachers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-emerald-600">
                          {t.teacherId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{t.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {t.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold text-slate-700">
                            {t.department?.code || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{t.designation}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(t.subjects || []).length === 0 ? (
                              <span className="text-xs text-slate-400">None assigned</span>
                            ) : (
                              (t.subjects || []).map((sub) => (
                                <Badge key={sub.id} variant="info" size="sm">
                                  {sub.code}
                                </Badge>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={t.status === 'Active' ? 'success' : 'secondary'} dot>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/teachers/${t.id}`}>
                              <button
                                title="View Faculty Profile"
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              title="Edit Faculty"
                              onClick={() => handleOpenEdit(t)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              title="Delete Faculty"
                              onClick={() => handleOpenDelete(t)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

        {/* Add Teacher Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Faculty Member"
          subtitle="Register a teacher and auto-provision their faculty portal access."
          maxWidth="2xl"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Teacher ID"
                required
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                placeholder="TCH-001"
              />
              <Input
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Rajesh Sharma"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@edumanage.com"
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                options={departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              />
              <Input
                label="Designation"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Professor / Assistant Professor"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
              />
              <Input
                label="Faculty Portal Password"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Teacher@123"
              />
            </div>

            {/* Subject Checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Assign Subjects
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
                {allSubjects.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 p-1.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.subjectIds.includes(sub.id)}
                      onChange={() => toggleSubjectSelection(sub.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>
                      <strong>{sub.code}</strong> - {sub.name} (Sem {sub.semester})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Save Faculty Member
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Teacher Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Faculty Member"
          subtitle="Update designation, contact details, or assigned subjects."
          maxWidth="2xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                options={departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              />
              <Input
                label="Designation"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Assign Subjects
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
                {allSubjects.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 p-1.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.subjectIds.includes(sub.id)}
                      onChange={() => toggleSubjectSelection(sub.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>
                      <strong>{sub.code}</strong> - {sub.name} (Sem {sub.semester})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
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
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteSubmit}
          isLoading={submitting}
          title="Delete Faculty Record"
          message={`Are you sure you want to permanently delete faculty member ${selectedTeacher?.name} (${selectedTeacher?.teacherId})? All mapped subjects will be unassigned.`}
        />
      </div>
    </AppLayout>
  );
}
