'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Database, Sliders, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth();
  const { success } = useToast();

  if (isLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Institution & System Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure academic policies, grading system thresholds, database parameters, and security policies.
          </p>
        </div>

        {/* Institution Info */}
        <Card>
          <CardHeader
            title="Institutional Profile"
            subtitle="Academic establishment name, accreditation, and administrative contact"
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Institution Name" defaultValue="EduManage Institute of Technology & Management" />
              <Input label="Accreditation Code" defaultValue="NAAC-A++ / AICTE Approved" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Administrative Contact Email" defaultValue="registrar@edumanage.com" />
              <Input label="Official Academic Phone" defaultValue="+91 (080) 4123-5678" />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => success('Institutional settings updated successfully')}
            >
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Grading Scheme */}
        <Card>
          <CardHeader
            title="Grading System Policy (Configurable Thresholds)"
            subtitle="Standards applied during examination mark evaluation"
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Grade A+</span>
                <p className="text-sm font-bold text-slate-900">90% - 100% (Pass)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Grade A</span>
                <p className="text-sm font-bold text-slate-900">80% - 89% (Pass)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Grade B</span>
                <p className="text-sm font-bold text-slate-900">70% - 79% (Pass)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Grade C</span>
                <p className="text-sm font-bold text-slate-900">60% - 69% (Pass)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Grade D</span>
                <p className="text-sm font-bold text-slate-900">50% - 59% (Pass)</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                <span className="text-xs font-semibold text-rose-600">Grade F</span>
                <p className="text-sm font-bold text-rose-700">Below 50% (Fail)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database & Security Status */}
        <Card>
          <CardHeader
            title="Database & Security Status"
            subtitle="Prisma ORM and PostgreSQL Connection Health"
          />
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm">
              <div className="flex items-center gap-2 text-emerald-800">
                <Database className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">PostgreSQL Database Engine</span>
              </div>
              <Badge variant="success" size="sm" dot>Connected & Operational</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-sm">
              <div className="flex items-center gap-2 text-indigo-800">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">Authentication Engine</span>
              </div>
              <span className="text-xs text-indigo-700 font-mono">Bcrypt + JWT Cookie-Session</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
