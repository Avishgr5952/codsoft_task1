'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  Download,
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
import { FeePaymentItem, StudentItem, DepartmentItem } from '@/types';
import { convertToCSV, downloadCSV } from '@/utils/exportCsv';

export default function FeeManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [fees, setFees] = useState<FeePaymentItem[]>([]);
  const [stats, setStats] = useState({ totalFees: 0, totalCollected: 0, totalPending: 0 });
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRecordPayOpen, setIsRecordPayOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [assignForm, setAssignForm] = useState({
    studentId: '',
    academicYear: '2024-2025',
    semester: 1,
    totalFee: 45000,
    amountPaid: 0,
    paymentMethod: 'Online / Card',
    notes: '',
  });

  const [recordPayForm, setRecordPayForm] = useState({
    amountPaid: 0,
    paymentMethod: 'Online / UPI',
    notes: '',
  });

  const fetchFees = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);
      if (deptFilter) query.append('departmentId', deptFilter);

      const res = await fetch(`/api/fees?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setFees(json.data.fees);
        setStats(json.data.stats);
      }
    } catch (e) {
      toastError('Failed to fetch fee records');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [stRes, deptRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/departments'),
      ]);
      const [stJson, deptJson] = await Promise.all([stRes.json(), deptRes.json()]);

      if (stJson.success) {
        setStudents(stJson.data);
        if (stJson.data.length > 0) {
          setAssignForm((prev) => ({ ...prev, studentId: stJson.data[0].id }));
        }
      }
      if (deptJson.success) setDepartments(deptJson.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchFees();
  }, [search, statusFilter, deptFilter]);

  const handleOpenAssign = () => {
    setAssignForm({
      studentId: students[0]?.id || '',
      academicYear: '2024-2025',
      semester: 1,
      totalFee: 45000,
      amountPaid: 0,
      paymentMethod: 'Online / Card',
      notes: '',
    });
    setIsAssignOpen(true);
  };

  const handleOpenRecordPayment = (fee: FeePaymentItem) => {
    setSelectedFee(fee);
    setRecordPayForm({
      amountPaid: fee.totalFee, // default to paying off the total
      paymentMethod: fee.paymentMethod || 'Online / UPI',
      notes: fee.notes || '',
    });
    setIsRecordPayOpen(true);
  };

  const handleOpenDelete = (fee: FeePaymentItem) => {
    setSelectedFee(fee);
    setIsDeleteOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to assign fee');
      success('Fee allocated successfully');
      setIsAssignOpen(false);
      fetchFees();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/fees/${selectedFee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordPayForm),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to record payment');
      success('Payment recorded and updated successfully');
      setIsRecordPayOpen(false);
      fetchFees();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedFee) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/fees/${selectedFee.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete fee invoice');
      success('Fee invoice deleted successfully');
      setIsDeleteOpen(false);
      fetchFees();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const csv = convertToCSV(
      fees.map((f: any) => ({
        invoiceNumber: f.invoiceNumber,
        studentId: f.student?.studentId || 'N/A',
        studentName: `${f.student?.firstName} ${f.student?.lastName}`,
        department: f.student?.department?.code || 'N/A',
        academicYear: f.academicYear,
        semester: f.semester,
        totalFee: f.totalFee,
        amountPaid: f.amountPaid,
        remainingAmount: f.remainingAmount,
        paymentStatus: f.paymentStatus,
        paymentMethod: f.paymentMethod || 'N/A',
      })),
      [
        { key: 'invoiceNumber', label: 'Invoice No.' },
        { key: 'studentId', label: 'Student ID' },
        { key: 'studentName', label: 'Student Name' },
        { key: 'department', label: 'Department' },
        { key: 'academicYear', label: 'Academic Year' },
        { key: 'semester', label: 'Semester' },
        { key: 'totalFee', label: 'Total Fee (INR)' },
        { key: 'amountPaid', label: 'Amount Paid (INR)' },
        { key: 'remainingAmount', label: 'Remaining (INR)' },
        { key: 'paymentStatus', label: 'Payment Status' },
        { key: 'paymentMethod', label: 'Payment Method' },
      ]
    );
    downloadCSV(csv, `fee_collection_report_${new Date().toISOString().split('T')[0]}`);
  };

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fee Administration</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage term tuition fees, invoice allocations, installment receipts, and dues.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAssign}
            >
              Assign Fee Invoice
            </Button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Assessed Fees</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{Number(stats.totalFees).toLocaleString()}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Across all student invoices</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Fees Collected</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  ₹{Number(stats.totalCollected).toLocaleString()}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Cleared installments & payments</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Outstanding Dues</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">
                  ₹{Number(stats.totalPending).toLocaleString()}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Pending student balances</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                placeholder="Search invoice number or student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="All Payment Statuses"
                options={[
                  { value: 'PAID', label: 'PAID (Fully Cleared)' },
                  { value: 'PARTIAL', label: 'PARTIAL (Installment)' },
                  { value: 'PENDING', label: 'PENDING (Unpaid)' },
                ]}
              />
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                placeholder="All Departments"
                options={departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fees Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Invoice #</th>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Term</th>
                    <th className="px-6 py-3.5">Total Fee</th>
                    <th className="px-6 py-3.5">Paid</th>
                    <th className="px-6 py-3.5">Balance</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8}>
                        <TableSkeleton rows={6} cols={8} />
                      </td>
                    </tr>
                  ) : fees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12">
                        <EmptyState
                          title="No fee records found"
                          description="Create or assign fee invoices to students."
                          action={
                            <Button size="sm" onClick={handleOpenAssign}>
                              Assign Fee
                            </Button>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    fees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-indigo-600">
                          {fee.invoiceNumber}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">
                            {fee.student?.firstName} {fee.student?.lastName}
                          </span>
                          <span className="text-xs text-slate-400 block font-mono">
                            {fee.student?.studentId} &bull; {fee.student?.department?.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          Sem {fee.semester} ({fee.academicYear})
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          ₹{Number(fee.totalFee).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-600">
                          ₹{Number(fee.amountPaid).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-rose-600">
                          ₹{Number(fee.remainingAmount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              fee.paymentStatus === 'PAID'
                                ? 'success'
                                : fee.paymentStatus === 'PARTIAL'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                            dot
                          >
                            {fee.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<DollarSign className="w-3.5 h-3.5" />}
                              onClick={() => handleOpenRecordPayment(fee)}
                            >
                              Update Payment
                            </Button>
                            <button
                              onClick={() => handleOpenDelete(fee)}
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

        {/* Assign Fee Modal */}
        <Modal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          title="Assign Fee Invoice"
          subtitle="Generate a tuition fee schedule for a student."
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <Select
              label="Select Student"
              required
              value={assignForm.studentId}
              onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.studentId} - ${s.firstName} ${s.lastName} (${s.department?.code || ''})`,
              }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Academic Year"
                required
                value={assignForm.academicYear}
                onChange={(e) => setAssignForm({ ...assignForm, academicYear: e.target.value })}
                placeholder="2024-2025"
              />
              <Select
                label="Semester"
                required
                value={assignForm.semester}
                onChange={(e) => setAssignForm({ ...assignForm, semester: Number(e.target.value) })}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Fee (₹)"
                type="number"
                required
                value={assignForm.totalFee}
                onChange={(e) => setAssignForm({ ...assignForm, totalFee: Number(e.target.value) })}
              />
              <Input
                label="Initial Payment (₹)"
                type="number"
                value={assignForm.amountPaid}
                onChange={(e) => setAssignForm({ ...assignForm, amountPaid: Number(e.target.value) })}
              />
            </div>

            <Select
              label="Payment Method"
              value={assignForm.paymentMethod}
              onChange={(e) => setAssignForm({ ...assignForm, paymentMethod: e.target.value })}
              options={[
                { value: 'Online / Card', label: 'Online / Credit Card' },
                { value: 'Bank Transfer', label: 'Bank Transfer / NEFT' },
                { value: 'Online / UPI', label: 'UPI / NetBanking' },
                { value: 'Cash', label: 'Cash Receipt' },
              ]}
            />

            <Input
              label="Invoice Remarks"
              placeholder="e.g. 1st installment paid at admission"
              value={assignForm.notes}
              onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsAssignOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Generate Invoice
              </Button>
            </div>
          </form>
        </Modal>

        {/* Record / Update Payment Modal */}
        <Modal
          isOpen={isRecordPayOpen}
          onClose={() => setIsRecordPayOpen(false)}
          title="Record Fee Payment"
          subtitle={`Invoice ${selectedFee?.invoiceNumber} - Total Assessed: ₹${Number(selectedFee?.totalFee || 0).toLocaleString()}`}
        >
          <form onSubmit={handleRecordPaySubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-800">
                  {selectedFee?.student?.firstName} {selectedFee?.student?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Amount Paid:</span>
                <span className="font-semibold text-emerald-600">
                  ₹{Number(selectedFee?.amountPaid || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Outstanding Balance:</span>
                <span className="font-semibold text-rose-600">
                  ₹{Number(selectedFee?.remainingAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <Input
              label="Total Cumulative Amount Paid (₹)"
              type="number"
              min={0}
              max={selectedFee?.totalFee}
              required
              value={recordPayForm.amountPaid}
              onChange={(e) => setRecordPayForm({ ...recordPayForm, amountPaid: Number(e.target.value) })}
              helperText={`Remaining will automatically compute to: ₹${Math.max(
                0,
                (selectedFee?.totalFee || 0) - recordPayForm.amountPaid
              ).toLocaleString()}`}
            />

            <Select
              label="Payment Method"
              value={recordPayForm.paymentMethod}
              onChange={(e) => setRecordPayForm({ ...recordPayForm, paymentMethod: e.target.value })}
              options={[
                { value: 'Online / Card', label: 'Online / Credit Card' },
                { value: 'Bank Transfer', label: 'Bank Transfer / NEFT' },
                { value: 'Online / UPI', label: 'UPI / NetBanking' },
                { value: 'Cash', label: 'Cash' },
              ]}
            />

            <Input
              label="Transaction Notes / Reference #"
              value={recordPayForm.notes}
              onChange={(e) => setRecordPayForm({ ...recordPayForm, notes: e.target.value })}
              placeholder="e.g. Reference #TXN81729182"
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsRecordPayOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                Save Payment
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
          title="Delete Fee Record"
          message={`Are you sure you want to delete invoice ${selectedFee?.invoiceNumber}?`}
        />
      </div>
    </AppLayout>
  );
}
