'use client';

import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Filter,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DepartmentItem, SubjectItem, StudentItem } from '@/types';

interface AttendanceSheetProps {
  teacherFilterId?: string; // If teacher is logged in, restrict to assigned subjects
}

export const AttendanceSheet: React.FC<AttendanceSheetProps> = ({ teacherFilterId }) => {
  const { success, error: toastError } = useToast();

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);

  // Selection filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance state: Map studentId -> { status: 'PRESENT' | 'ABSENT' | 'LATE', remarks: string }
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks: string }>
  >({});

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Fetch departments
  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await fetch('/api/departments');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setDepartments(json.data);
          setSelectedDept(json.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  // 2. Fetch subjects for selected dept and semester
  useEffect(() => {
    if (!selectedDept) return;
    async function loadSubjects() {
      try {
        const res = await fetch(`/api/subjects?departmentId=${selectedDept}&semester=${selectedSemester}`);
        const json = await res.json();
        if (json.success) {
          let list = json.data;
          if (teacherFilterId) {
            list = list.filter((s: any) => s.teacherId === teacherFilterId);
          }
          setSubjects(list);
          if (list.length > 0) {
            setSelectedSubject(list[0].id);
          } else {
            setSelectedSubject('');
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSubjects();
  }, [selectedDept, selectedSemester, teacherFilterId]);

  // 3. Load students for current class & check existing attendance for date
  useEffect(() => {
    if (!selectedDept || !selectedSubject) return;

    async function loadStudentsAndExistingAttendance() {
      setLoadingStudents(true);
      try {
        // Fetch students
        const stRes = await fetch(
          `/api/students?departmentId=${selectedDept}&semester=${selectedSemester}&section=${selectedSection}&status=Active`
        );
        const stJson = await stRes.json();
        const studentList: StudentItem[] = stJson.data || [];
        setStudents(studentList);

        // Fetch existing attendance for this subject and date
        const attRes = await fetch(
          `/api/attendance?subjectId=${selectedSubject}&date=${selectedDate}&departmentId=${selectedDept}&semester=${selectedSemester}&section=${selectedSection}`
        );
        const attJson = await attRes.json();
        const existingRecords = attJson.data || [];

        // Build mapping
        const map: Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE'; remarks: string }> = {};

        studentList.forEach((st) => {
          const matched = existingRecords.find((r: any) => r.studentId === st.id);
          if (matched) {
            map[st.id] = {
              status: matched.status,
              remarks: matched.remarks || '',
            };
          } else {
            // Default to PRESENT for easy marking
            map[st.id] = {
              status: 'PRESENT',
              remarks: '',
            };
          }
        });

        setAttendanceMap(map);
      } catch (e) {
        toastError('Failed to load students for attendance');
      } finally {
        setLoadingStudents(false);
      }
    }

    loadStudentsAndExistingAttendance();
  }, [selectedDept, selectedSemester, selectedSection, selectedSubject, selectedDate]);

  const setAllStatus = (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceMap((prev) => {
      const next = { ...prev };
      students.forEach((st) => {
        next[st.id] = {
          status,
          remarks: next[st.id]?.remarks || '',
        };
      });
      return next;
    });
  };

  const updateStudentAttendance = (
    studentId: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE',
    remarks?: string
  ) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        status,
        remarks: remarks !== undefined ? remarks : prev[studentId]?.remarks || '',
      },
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubject) {
      toastError('Please select a subject first');
      return;
    }

    if (students.length === 0) {
      toastError('No students found to mark attendance');
      return;
    }

    setSaving(true);
    try {
      const records = students.map((st) => ({
        studentId: st.id,
        status: attendanceMap[st.id]?.status || 'PRESENT',
        remarks: attendanceMap[st.id]?.remarks || null,
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          date: selectedDate,
          records,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save attendance');

      success(json.message || 'Attendance saved successfully without duplicates');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Stats for this session
  const total = students.length;
  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'PRESENT').length;
  const lateCount = Object.values(attendanceMap).filter((a) => a.status === 'LATE').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === 'ABSENT').length;
  const percent = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Session Selector Card */}
      <Card>
        <CardHeader
          title="Daily Attendance Register"
          subtitle="Select class parameters to load the student roll call"
        />
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select
              label="Department"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
            />

            <Select
              label="Semester"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))}
            />

            <Select
              label="Section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              options={[
                { value: 'A', label: 'Section A' },
                { value: 'B', label: 'Section B' },
                { value: 'C', label: 'Section C' },
              ]}
            />

            <Select
              label="Subject / Course"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              placeholder={subjects.length === 0 ? 'No subjects in semester' : 'Select Subject'}
              options={subjects.map((sub) => ({
                value: sub.id,
                label: `${sub.code} - ${sub.name}`,
              }))}
            />

            <Input
              label="Attendance Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Roster & Quick Actions Card */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-3">
              <span>Student Roll Call ({students.length} Enrolled)</span>
              {students.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">Present: {presentCount}</Badge>
                  <Badge variant="warning" size="sm">Late: {lateCount}</Badge>
                  <Badge variant="danger" size="sm">Absent: {absentCount}</Badge>
                  <Badge variant="primary" size="sm">Rate: {percent}%</Badge>
                </div>
              )}
            </div>
          }
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllStatus('PRESENT')}
                disabled={students.length === 0}
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllStatus('ABSENT')}
                disabled={students.length === 0}
              >
                Mark All Absent
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Save className="w-4 h-4" />}
                onClick={handleSaveAttendance}
                isLoading={saving}
                disabled={students.length === 0}
              >
                Save Attendance
              </Button>
            </div>
          }
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                <tr>
                  <th className="px-6 py-3.5">Roll No. / ID</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Attendance Status</th>
                  <th className="px-6 py-3.5">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingStudents ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      Loading class roster...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No students enrolled</p>
                      <p className="text-xs text-slate-400 mt-1">
                        No active students found in {departments.find(d => d.id === selectedDept)?.code} Semester {selectedSemester} Section {selectedSection}.
                      </p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const currentStatus = attendanceMap[student.id]?.status || 'PRESENT';
                    const currentRemarks = attendanceMap[student.id]?.remarks || '';

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-indigo-600">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">
                            {student.firstName} {student.lastName}
                          </span>
                          <span className="text-xs text-slate-400 block">{student.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 gap-1">
                            <button
                              type="button"
                              onClick={() => updateStudentAttendance(student.id, 'PRESENT')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                currentStatus === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-200'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStudentAttendance(student.id, 'LATE')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                currentStatus === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-amber-700 hover:bg-slate-200'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              Late
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStudentAttendance(student.id, 'ABSENT')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                currentStatus === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-slate-200'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            placeholder="Optional notes..."
                            value={currentRemarks}
                            onChange={(e) =>
                              updateStudentAttendance(student.id, currentStatus, e.target.value)
                            }
                            className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
