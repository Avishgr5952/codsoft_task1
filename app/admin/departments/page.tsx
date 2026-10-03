'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { DepartmentItem } from '@/types';

export default function DepartmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/departments?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setDepartments(json.data);
      }
    } catch (e) {
      toastError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [search]);

  const handleOpenAdd = () => {
    setFormData({ code: '', name: '', description: '' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentItem) => {
    setSelectedDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      description: dept.description || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (dept: DepartmentItem) => {
    setSelectedDept(dept);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create department');
      success('Department created successfully');
      setIsAddOpen(false);
      fetchDepartments();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/departments/${selectedDept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update department');
      success('Department updated successfully');
      setIsEditOpen(false);
      fetchDepartments();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedDept) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/departments/${selectedDept.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete department');
      success('Department deleted successfully');
      setIsDeleteOpen(false);
      fetchDepartments();
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Departments</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Organize academic programs, faculties, courses, and department heads.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add Department
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <Input
              placeholder="Search department code or name (e.g., BCA, Computer Applications)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </CardContent>
        </Card>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)
          ) : departments.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="No departments found"
                description="Create a department like BCA, BBA, BCom, or MCA to begin assigning subjects and students."
                action={
                  <Button size="sm" onClick={handleOpenAdd}>
                    Add Department
                  </Button>
                }
              />
            </div>
          ) : (
            departments.map((dept) => (
              <Card key={dept.id} className="hover:shadow-md transition-shadow">
                <CardHeader
                  title={
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-xs">
                        {dept.code}
                      </span>
                      <span className="truncate">{dept.name}</span>
                    </div>
                  }
                  action={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(dept)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  }
                />
                <CardContent className="space-y-4 pt-3">
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {dept.description || 'No description provided for this department.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" /> Students
                      </p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {dept._count?.students || 0}
                      </p>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <GraduationCap className="w-3 h-3" /> Faculty
                      </p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {dept._count?.teachers || 0}
                      </p>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <BookOpen className="w-3 h-3" /> Subjects
                      </p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {dept._count?.subjects || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Modal */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create New Department"
          subtitle="Define an academic division or program code."
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <Input
              label="Department Code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. BCA, BBA, MCA"
            />
            <Input
              label="Department Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Department of Computer Applications"
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Overview of the program, curriculum highlights, and objectives..."
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Create Department
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Department"
          subtitle="Update program details."
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Department Code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
            <Input
              label="Department Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          title="Delete Department"
          message={`Are you sure you want to delete ${selectedDept?.name} (${selectedDept?.code})? This will fail if students, faculty, or subjects are still mapped to it.`}
        />
      </div>
    </AppLayout>
  );
}
