# EduManage – Student Management System

[![Next.js](https://img.shields.io/badge/Next.js-14.2.24-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)

A modern, production-grade, responsive full-stack Education ERP platform built for colleges and universities to centralize day-to-day academic and administrative activities.

---

## 🌟 Key Features & Capabilities

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **Role Isolation**: Strict middleware protection across **Admin**, **Teacher**, and **Student** portals.
- **Secure Password Hashing**: Passwords hashed using `bcryptjs` with salt rounds. No plaintext credentials stored.
- **Session Tokens**: JWT cookie session handling with standard Bearer token fallback.
- **One-Click Demo Switcher**: Login page provides instantaneous one-click credential autofill for easy evaluation.

### 🏛️ 2. Administrator Portal (`/admin/*`)
- **Executive Analytics Dashboard**:
  - Live metric summary cards: Total Students, Total Faculty, Courses/Subjects, Total Attendance Records, Pending Dues, Upcoming Examinations.
  - Interactive Visualizations (Recharts): Students by Department (Bar Chart), Attendance Status Breakdown (Pie Chart), Academic Grade Distribution (A+, A, B, C, D, F).
  - Recent activity feeds for student admissions and fee collections.
- **Student Management**:
  - Comprehensive student directory with multi-field search (Name, Student ID, Email) and filtering (Department, Semester, Section, Status).
  - Register, edit, delete students with confirmation safety modals.
  - In-depth **Student 360° Profile**: Personal Information, Attendance log history, Exam result cards, Fee invoices, and Cumulative Academic Records.
  - Export student roster as CSV.
- **Teacher Management**:
  - Faculty directory with Department assignment and Subject allocation.
  - Add, edit, delete instructors with faculty login account provisioning.
  - Teacher detail view showing taught courses and classes conducted.
- **Department Management**:
  - Department code and name configuration (e.g., BCA, BBA, BCom, MCA).
  - Deletion safeguard: blocks deleting departments that still contain enrolled students or assigned teachers.
- **Subject Management**:
  - Syllabus subjects, semester assignment, credits allocation, and teacher assignments.
- **Attendance Register**:
  - Batch roll-call matrix with one-click **"Mark All Present"** / **"Mark All Absent"**.
  - Anti-duplication database constraint ensuring no duplicate records per `(Student, Subject, Date)`.
- **Examinations & Grading**:
  - Schedule midterms and end-terms with maximum marks, pass marks, and dates.
  - Integrated grading sheet with live automatic calculations of **Percentage**, **Letter Grade (A+, A, B, C, D, F)**, and **Pass/Fail status**.
- **Fee Management**:
  - Term invoice generation and student assignment.
  - Partial/installment receipt recording with automated balance tracking (`Remaining = Total - Paid`).
  - Real-time institutional totals: Total Assessed, Total Collected, Outstanding Dues.
  - Export fee collection report as CSV.
- **Academic Records**:
  - Term GPA and CGPA transcription, credit audit, and completion status.
- **Auditing & Reports**:
  - Tabbed reporting matrices for Students, Attendance, Examinations, and Fees.
  - Export any report as a CSV file.

### 👨‍🏫 3. Teacher Portal (`/teacher/*`)
- **Faculty Dashboard**: Assigned subjects, student headcount in department, and upcoming scheduled tests.
- **Attendance Register**: Mark daily attendance for allocated subjects.
- **Exam Marks Entry**: Grade students with live percentage and letter grade feedback.
- **Subject Roster**: View syllabus courses and syllabus credit breakdown.
- **Student Directory**: Inspect student profiles within the department.

### 🎓 4. Student Portal (`/student/*`)
- **Student Dashboard**: Attendance rate, enrolled subjects, examination timetable, latest grades, and fee balances.
- **Personal Profile**: View official institutional identity, contact info, and semester enrollment.
- **Attendance Tracker**: Subject-by-subject attendance percentages with visual progress bars and lecture logs.
- **Exam Timetable**: Dates, timings, maximum marks, and duration for upcoming assessments.
- **Grade Cards & Transcripts**: Historical exam scores and official GPA / CGPA records.
- **Fee Status**: Itemized invoices, payment history, and pending balances.
- **Safety Restriction**: Students are restricted to read-only access for administrative data.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Next.js Route Handlers (REST API), Node.js, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs`, HTTP-only secure cookie session |
| **Utilities** | Date-fns, CSV generator |

---

## 📁 Project Structure

```
├── app/
│   ├── admin/               # Administrator Portal
│   │   ├── dashboard/       # Metric cards & Recharts
│   │   ├── students/        # Student Directory & 360° Profile ([id])
│   │   ├── teachers/        # Faculty Directory & Profile ([id])
│   │   ├── departments/     # Academic Department management
│   │   ├── subjects/        # Curriculum & Subject management
│   │   ├── attendance/      # Batch attendance register
│   │   ├── examinations/    # Exam scheduling & Grading sheet ([id])
│   │   ├── fees/            # Tuition fee invoices & payments
│   │   ├── records/         # Term transcripts & GPA records
│   │   ├── reports/         # Audits & CSV export
│   │   └── settings/        # System settings & grading policies
│   ├── teacher/             # Faculty Portal
│   │   ├── dashboard/       # Teacher summary & quick links
│   │   ├── attendance/      # Daily class attendance marking
│   │   ├── marks/           # Student marks & grading
│   │   ├── subjects/        # Assigned course curriculum
│   │   └── students/        # Student roster view
│   ├── student/             # Student Portal
│   │   ├── dashboard/       # Personal academic overview
│   │   ├── profile/         # Official student record
│   │   ├── attendance/      # Attendance % & subject breakdown
│   │   ├── exams/           # Timetable & scheduled exams
│   │   ├── results/         # Published results & letter grades
│   │   ├── fees/            # Fee invoice statement & balance
│   │   └── records/         # Term GPA & CGPA transcripts
│   ├── api/                 # REST API Route Handlers
│   │   ├── auth/            # login, logout, me
│   │   ├── dashboard/       # admin, teacher, student summary endpoints
│   │   ├── students/        # GET, POST, PUT, DELETE
│   │   ├── teachers/        # GET, POST, PUT, DELETE
│   │   ├── departments/     # GET, POST, PUT, DELETE
│   │   ├── subjects/        # GET, POST, PUT, DELETE
│   │   ├── attendance/      # GET, POST (bulk upsert), stats
│   │   ├── exams/           # GET, POST, PUT, DELETE
│   │   ├── results/         # GET, POST (bulk grading with auto calculations)
│   │   ├── fees/            # GET, POST, PUT, DELETE
│   │   ├── records/         # GET, POST
│   │   └── reports/         # GET (students, attendance, exams, fees)
│   ├── login/               # Academic Portal Login Page
│   ├── globals.css          # Tailwind CSS root styling
│   ├── layout.tsx           # Global root HTML & metadata
│   └── page.tsx             # Root session redirect router
├── components/
│   ├── attendance/          # Reusable AttendanceSheet component
│   ├── charts/              # Recharts Bar and Pie components
│   ├── layout/              # AppLayout, Navbar, Admin/Teacher/Student Sidebars
│   └── ui/                  # Button, Badge, Card, Modal, ConfirmModal, Input, Select, Toast
├── lib/
│   ├── api-response.ts      # Standardized JSON response helpers
│   ├── auth.ts              # Session extraction & role authorization
│   ├── jwt.ts               # JWT signing, verification & bcrypt hashing
│   └── prisma.ts            # PrismaClient singleton instance
├── prisma/
│   ├── schema.prisma        # Complete PostgreSQL relational schema
│   └── seed.ts              # Demo seed data script
├── types/                   # TypeScript interfaces and entity types
├── utils/                   # Grade calculation & CSV export utilities
├── .env.example             # Template for environment configuration
└── middleware.ts            # Route protection and role verification
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ / v24+ supported)
- **npm** or **yarn**

### 1. Clone & Install Dependencies
```bash
git clone <repository_url>
cd "student management"
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `.env` contains:
```env
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/edumanage?schema=public"
DIRECT_URL="postgresql://postgres:password@127.0.0.1:5432/edumanage?schema=public"

AUTH_SECRET="super-secret-jwt-key-for-edumanage-system-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup & Seeding

EduManage comes with an embedded zero-configuration PostgreSQL engine (`@electric-sql/pglite` & `pglite-server`) that persists data directly to `./prisma/pgdata` over standard PostgreSQL TCP protocol, or you can connect any existing PostgreSQL instance (Supabase, Neon, AWS RDS, or local Postgres).

To start the embedded PostgreSQL engine:
```bash
npm run db:start
```

Push schema to PostgreSQL:
```bash
npx prisma db push
```

Generate Prisma Client:
```bash
npx prisma generate
```

Seed initial sample data (Admin, Teachers, Students, Departments, Subjects, Attendance, Exams, Results, Fees):
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Login Credentials

The seed script initializes three accounts for testing:

| Portal | Email | Password | Role | Redirect Path |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@edumanage.com` | `Admin@123` | `ADMIN` | `/admin/dashboard` |
| **Teacher / Faculty** | `teacher@edumanage.com` | `Teacher@123` | `TEACHER` | `/teacher/dashboard` |
| **Student Portal** | `student@edumanage.com` | `Student@123` | `STUDENT` | `/student/dashboard` |

> 💡 **Quick Tip**: On the `/login` page, you can click any of the **Quick Demo Login** buttons to automatically fill in the credentials and log in instantly!

---

## 📡 REST API Overview

All API endpoints return standard JSON responses: `{ "success": boolean, "data"?: any, "error"?: string }`.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate and obtain session cookie | Public |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Authenticated |
| `POST` | `/api/auth/logout` | Terminate session and clear cookie | Authenticated |
| `GET` | `/api/dashboard/admin` | Metrics, charts, and recent activity feeds | Admin |
| `GET` | `/api/dashboard/teacher` | Assigned subjects, students, upcoming exams | Teacher, Admin |
| `GET` | `/api/dashboard/student` | Attendance %, enrolled courses, exams, fees | Student, Admin |
| `GET, POST` | `/api/students` | List students (search & filter), Create student | Admin (GET: Auth) |
| `GET, PUT, DELETE`| `/api/students/:id` | View 360° profile, Update student, Delete | Admin (GET: Auth) |
| `GET, POST` | `/api/teachers` | List teachers, Register new faculty | Admin (GET: Auth) |
| `GET, PUT, DELETE`| `/api/teachers/:id` | View teacher profile, Update, Delete | Admin (GET: Auth) |
| `GET, POST` | `/api/departments` | List departments, Create department | Admin (GET: Auth) |
| `GET, PUT, DELETE`| `/api/departments/:id` | View department details, Update, Delete | Admin |
| `GET, POST` | `/api/subjects` | List subjects, Create syllabus subject | Admin (GET: Auth) |
| `GET, PUT, DELETE`| `/api/subjects/:id` | View subject details, Update, Delete | Admin |
| `GET, POST` | `/api/attendance` | Get attendance logs, Bulk mark attendance | Teacher, Admin |
| `GET` | `/api/attendance/stats` | Calculate attendance percentages & subject rate | Authenticated |
| `GET, POST` | `/api/exams` | List exams, Schedule examination | Teacher, Admin |
| `GET, PUT, DELETE`| `/api/exams/:id` | View exam with grading sheet, Update, Delete | Teacher, Admin |
| `GET, POST` | `/api/results` | List results, Bulk enter marks & compute grades | Teacher, Admin |
| `GET, POST` | `/api/fees` | List fee invoices & metrics, Assign fee invoice | Admin (GET: Auth) |
| `PUT, DELETE` | `/api/fees/:id` | Record installment payment, Delete invoice | Admin |
| `GET, POST` | `/api/records` | List academic transcripts, Store term record | Admin (GET: Auth) |
| `GET` | `/api/reports?type=...`| Downloadable reports (students, attendance, exams, fees)| Admin |

---

## 🎯 Grading Logic Configuration

Evaluations automatically calculate percentage, letter grade, and passing status based on standard academic tiers:
- **90% - 100%**: `A+` (PASS)
- **80% - 89%**: `A` (PASS)
- **70% - 79%**: `B` (PASS)
- **60% - 69%**: `C` (PASS)
- **50% - 59%**: `D` (PASS)
- **Below 50%**: `F` (FAIL)

---

## 🔒 Security Best Practices Implemented
1. **Password Encryption**: All passwords stored using standard `bcrypt` hashing with salt rounds.
2. **Access Control**: Role authorization validated on both client middleware and backend API route handlers.
3. **SQL Injection Defense**: All database queries executed via Prisma ORM parameterized statements.
4. **Data Integrity**: Foreign key constraints and unique compound constraints (e.g. `(studentId, subjectId, date)` in attendance) prevent orphaned records and duplication.
5. **Session Safety**: HTTP-only, `sameSite='lax'` cookies prevent cross-site scripting (XSS) credential leaks.

---

## 🚀 Future Roadmap & Enhancements
- [ ] Push notifications for upcoming exams and fee dues.
- [ ] Direct online payment gateway integration (Stripe / Razorpay).
- [ ] Automated PDF transcript generation with downloadable report cards.
- [ ] Biometric & RFID card attendance hardware integration.

---

## 📜 License
EduManage is open-source educational software released under the [MIT License](LICENSE).
