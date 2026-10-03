'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, GraduationCap, ShieldCheck } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/student');
        const json = await res.json();
        if (json.success) setStudent(json.data.student);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (authLoading || !user) return null;

  return (
    <AppLayout user={user}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Personal Academic Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your verified institutional enrollment records and registered academic information.
          </p>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : !student ? (
          <Card className="p-8 text-center text-slate-500">No profile found</Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Student Identity" />
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Student ID / Roll No.</span>
                  <span className="font-mono font-bold text-indigo-600">{student.studentId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-semibold text-slate-900">{student.firstName} {student.lastName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-medium text-slate-900">{student.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-medium text-slate-900">{student.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-medium text-slate-900">{student.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Date of Birth</span>
                  <span className="font-medium text-slate-900">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-slate-500">Residential Address</span>
                  <span className="font-medium text-slate-900 text-right">{student.address || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Enrollment Details" />
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Degree Course</span>
                  <span className="font-semibold text-slate-900">{student.course}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Academic Department</span>
                  <span className="font-medium text-slate-900">{student.department?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Current Semester</span>
                  <span className="font-semibold text-indigo-600">Semester {student.semester}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">Assigned Section</span>
                  <span className="font-semibold text-slate-900">Section {student.section}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-slate-500">Admission Date</span>
                  <span className="font-medium text-slate-900">
                    {new Date(student.admissionDate).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
