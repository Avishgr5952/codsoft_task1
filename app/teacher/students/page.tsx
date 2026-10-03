'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Mail, Eye } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StudentItem } from '@/types';

export default function TeacherStudentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const res = await fetch(`/api/students?search=${encodeURIComponent(search)}`);
        const json = await res.json();
        if (json.success) {
          setStudents(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [search]);

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Enrolled Students Roster</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View student profiles, department enrollments, and academic standing.
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Student ID</th>
                    <th className="px-6 py-3.5">Name & Email</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Semester & Section</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">View Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={6}><TableSkeleton rows={5} cols={6} /></td></tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12">
                        <EmptyState title="No students found" description="No students match your query." />
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-emerald-600">
                          {st.studentId}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">{st.firstName} {st.lastName}</span>
                          <span className="text-xs text-slate-400 block">{st.email}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{st.department?.code}</td>
                        <td className="px-6 py-4 text-slate-700">Sem {st.semester} - {st.section}</td>
                        <td className="px-6 py-4">
                          <Badge variant={st.status === 'Active' ? 'success' : 'secondary'} size="sm" dot>
                            {st.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/students/${st.id}`}>
                            <button
                              title="View Full Profile"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
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
