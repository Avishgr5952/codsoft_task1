export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentId?: string;
  teacherId?: string;
}

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  _count?: {
    students: number;
    teachers: number;
    subjects: number;
  };
}

export interface TeacherItem {
  id: string;
  teacherId: string;
  name: string;
  email: string;
  phone?: string | null;
  designation: string;
  joiningDate: string;
  status: string;
  departmentId: string;
  department?: {
    id: string;
    code: string;
    name: string;
  };
  subjects?: Array<{
    id: string;
    code: string;
    name: string;
    semester: number;
  }>;
}

export interface StudentItem {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  departmentId: string;
  department?: {
    id: string;
    code: string;
    name: string;
  };
  course: string;
  semester: number;
  section: string;
  admissionDate: string;
  profilePhoto?: string | null;
  status: string;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  department?: {
    id: string;
    code: string;
    name: string;
  };
  semester: number;
  credits: number;
  teacherId?: string | null;
  teacher?: {
    id: string;
    name: string;
    teacherId: string;
  } | null;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  student?: {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
  };
  subjectId: string;
  subject?: {
    id: string;
    code: string;
    name: string;
  };
  date: string;
  status: AttendanceStatus;
  remarks?: string | null;
}

export interface ExamItem {
  id: string;
  examCode: string;
  name: string;
  departmentId: string;
  department?: {
    id: string;
    code: string;
    name: string;
  };
  subjectId: string;
  subject?: {
    id: string;
    code: string;
    name: string;
  };
  semester: number;
  examDate: string;
  startTime?: string | null;
  durationMinutes: number;
  maxMarks: number;
  passMarks: number;
  _count?: {
    results: number;
  };
}

export interface ExamResultItem {
  id: string;
  examId: string;
  exam?: {
    id: string;
    name: string;
    examCode: string;
    maxMarks: number;
    subject?: {
      code: string;
      name: string;
    };
  };
  studentId: string;
  student?: {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
  };
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  status: 'PASS' | 'FAIL';
  remarks?: string | null;
}

export interface FeePaymentItem {
  id: string;
  invoiceNumber: string;
  studentId: string;
  student?: {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    department?: {
      code: string;
      name: string;
    };
  };
  academicYear: string;
  semester: number;
  totalFee: number;
  amountPaid: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  paymentDate?: string | null;
  notes?: string | null;
}

export interface AcademicRecordItem {
  id: string;
  studentId: string;
  student?: {
    studentId: string;
    firstName: string;
    lastName: string;
    department?: {
      name: string;
    };
  };
  academicYear: string;
  semester: number;
  totalSubjects: number;
  totalCredits: number;
  gpa?: number | null;
  cgpa?: number | null;
  attendancePercentage?: number | null;
  overallGrade?: string | null;
  status: string;
}
