'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentAttendancePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch('/api/attendance/stats'),
          fetch('/api/attendance'),
        ]);
        const [statsJson, logsJson] = await Promise.all([statsRes.json(), logsRes.json()]);

        if (statsJson.success) setStats(statsJson.data);
        if (logsJson.success) setLogs(logsJson.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  if (authLoading || !user) return null;

  const summary = stats?.summary || {
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    overallPercentage: 0,
  };

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Statistics & Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time tracking of lecture attendance, minimum requirements, and subject rates.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500 font-semibold">Overall Attendance</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{summary.overallPercentage}%</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500 font-semibold">Total Classes</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.total}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500 font-semibold">Present / Late</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  {summary.present} <span className="text-sm text-amber-500 font-normal">({summary.late} late)</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500 font-semibold">Absent</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{summary.absent}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Breakdown */}
        <Card>
          <CardHeader title="Subject-Wise Attendance Breakdown" subtitle="Rate across each syllabus course" />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Subject Code & Name</th>
                    <th className="px-6 py-3.5">Total Classes</th>
                    <th className="px-6 py-3.5">Attended</th>
                    <th className="px-6 py-3.5">Absent</th>
                    <th className="px-6 py-3.5">Attendance Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5}><Skeleton className="h-16 w-full m-4" /></td></tr>
                  ) : (stats?.bySubject || []).length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-400">No subject records available</td></tr>
                  ) : (
                    stats.bySubject.map((s: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">{s.code}</span> - {s.name}
                        </td>
                        <td className="px-6 py-4 text-slate-700">{s.total}</td>
                        <td className="px-6 py-4 text-emerald-600 font-semibold">{s.present + s.late}</td>
                        <td className="px-6 py-4 text-rose-600 font-semibold">{s.absent}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900">{s.percentage}%</span>
                            <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${
                                  s.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, s.percentage)}%` }}
                              />
                            </div>
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

        {/* Detailed Session Logs */}
        <Card>
          <CardHeader title="Daily Class Attendance Log" subtitle="Comprehensive historical roll logs" />
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-400">No logs found</td></tr>
                  ) : (
                    logs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3 font-medium text-slate-900">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="px-6 py-3">{log.subject.code} - {log.subject.name}</td>
                        <td className="px-6 py-3">
                          <Badge variant={log.status === 'PRESENT' ? 'success' : log.status === 'LATE' ? 'warning' : 'danger'} size="sm" dot>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-slate-400 text-xs">{log.remarks || 'Regular lecture'}</td>
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
