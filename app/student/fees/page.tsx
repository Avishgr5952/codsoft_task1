'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StudentFeesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFees() {
      try {
        const res = await fetch('/api/fees');
        const json = await res.json();
        if (json.success) {
          setFees(json.data.fees || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFees();
  }, []);

  if (authLoading || !user) return null;

  const totalFee = fees.reduce((sum, f) => sum + f.totalFee, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.amountPaid, 0);
  const remaining = fees.reduce((sum, f) => sum + f.remainingAmount, 0);

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Fee Statement</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tuition fee assessments, installment receipts, and balance summary.
          </p>
        </div>

        {/* 3 summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Assessed Fee</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{Number(totalFee).toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Amount Paid</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹{Number(totalPaid).toLocaleString()}</h3>
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
                <h3 className={`text-2xl font-bold mt-1 ${remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹{Number(remaining).toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader title="Fee Invoices & Receipts" subtitle="Institutional billing records" />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Invoice #</th>
                    <th className="px-6 py-3.5">Academic Term</th>
                    <th className="px-6 py-3.5">Total Fee</th>
                    <th className="px-6 py-3.5">Amount Paid</th>
                    <th className="px-6 py-3.5">Remaining Balance</th>
                    <th className="px-6 py-3.5">Payment Method</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={7}><TableSkeleton rows={4} cols={7} /></td></tr>
                  ) : fees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12">
                        <EmptyState title="No fee records found" description="No invoices currently issued for your student account." />
                      </td>
                    </tr>
                  ) : (
                    fees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-indigo-600">
                          {fee.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {fee.academicYear} (Semester {fee.semester})
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
                        <td className="px-6 py-4 text-slate-600 text-xs">{fee.paymentMethod || 'Pending'}</td>
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
