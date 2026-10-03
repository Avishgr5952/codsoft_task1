import { PrismaClient, Role, AttendanceStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPass(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('--- Seeding EduManage Database ---');

  // Clean existing data in reverse dependency order
  await prisma.academicRecord.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Departments
  console.log('Seeding Departments...');
  const deptBCA = await prisma.department.create({
    data: {
      code: 'BCA',
      name: 'Department of Computer Applications',
      description: 'Undergraduate computer science and software development program',
    },
  });

  const deptBBA = await prisma.department.create({
    data: {
      code: 'BBA',
      name: 'Department of Business Administration',
      description: 'Management, entrepreneurship, and organizational leadership',
    },
  });

  const deptBCOM = await prisma.department.create({
    data: {
      code: 'BCOM',
      name: 'Department of Commerce & Finance',
      description: 'Financial accounting, taxation, and economic principles',
    },
  });

  const deptMCA = await prisma.department.create({
    data: {
      code: 'MCA',
      name: 'Department of Master of Computer Applications',
      description: 'Postgraduate computing, data engineering, and AI architecture',
    },
  });

  // 2. Create Admin User
  console.log('Seeding Admin...');
  const adminHashedPassword = await hashPass('Admin@123');
  await prisma.user.create({
    data: {
      email: 'admin@edumanage.com',
      name: 'System Administrator',
      password: adminHashedPassword,
      role: Role.ADMIN,
    },
  });

  // 3. Create Teachers
  console.log('Seeding Teachers...');
  const teacherHashedPassword = await hashPass('Teacher@123');
  
  const teacherUser1 = await prisma.user.create({
    data: {
      email: 'teacher@edumanage.com',
      name: 'Dr. Rajesh Sharma',
      password: teacherHashedPassword,
      role: Role.TEACHER,
    },
  });

  const teacher1 = await prisma.teacher.create({
    data: {
      teacherId: 'TCH-001',
      name: 'Dr. Rajesh Sharma',
      email: 'teacher@edumanage.com',
      phone: '+91 98765 43210',
      designation: 'Professor & Head of Dept',
      status: 'Active',
      departmentId: deptBCA.id,
      userId: teacherUser1.id,
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: 'priya.patel@edumanage.com',
      name: 'Prof. Priya Patel',
      password: teacherHashedPassword,
      role: Role.TEACHER,
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      teacherId: 'TCH-002',
      name: 'Prof. Priya Patel',
      email: 'priya.patel@edumanage.com',
      phone: '+91 98765 43211',
      designation: 'Associate Professor',
      status: 'Active',
      departmentId: deptBBA.id,
      userId: teacherUser2.id,
    },
  });

  const teacherUser3 = await prisma.user.create({
    data: {
      email: 'anand.verma@edumanage.com',
      name: 'Prof. Anand Verma',
      password: teacherHashedPassword,
      role: Role.TEACHER,
    },
  });

  const teacher3 = await prisma.teacher.create({
    data: {
      teacherId: 'TCH-003',
      name: 'Prof. Anand Verma',
      email: 'anand.verma@edumanage.com',
      phone: '+91 98765 43212',
      designation: 'Assistant Professor',
      status: 'Active',
      departmentId: deptBCA.id,
      userId: teacherUser3.id,
    },
  });

  // 4. Create Subjects
  console.log('Seeding Subjects...');
  const subWebDev = await prisma.subject.create({
    data: {
      code: 'BCA101',
      name: 'Modern Web Development & Next.js',
      departmentId: deptBCA.id,
      semester: 1,
      credits: 4,
      teacherId: teacher1.id,
    },
  });

  const subDSA = await prisma.subject.create({
    data: {
      code: 'BCA102',
      name: 'Data Structures & Algorithms',
      departmentId: deptBCA.id,
      semester: 1,
      credits: 4,
      teacherId: teacher3.id,
    },
  });

  const subDBMS = await prisma.subject.create({
    data: {
      code: 'BCA103',
      name: 'Database Management Systems',
      departmentId: deptBCA.id,
      semester: 1,
      credits: 3,
      teacherId: teacher1.id,
    },
  });

  const subMgmt = await prisma.subject.create({
    data: {
      code: 'BBA101',
      name: 'Principles of Business Management',
      departmentId: deptBBA.id,
      semester: 1,
      credits: 3,
      teacherId: teacher2.id,
    },
  });

  const subAcct = await prisma.subject.create({
    data: {
      code: 'BBA102',
      name: 'Corporate Financial Accounting',
      departmentId: deptBBA.id,
      semester: 1,
      credits: 4,
      teacherId: teacher2.id,
    },
  });

  // 5. Create Students
  console.log('Seeding Students...');
  const studentHashedPassword = await hashPass('Student@123');

  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student@edumanage.com',
      name: 'Rahul Sharma',
      password: studentHashedPassword,
      role: Role.STUDENT,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      studentId: 'STU-2024-001',
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'student@edumanage.com',
      phone: '+91 91234 56789',
      dateOfBirth: new Date('2003-05-15'),
      gender: 'Male',
      address: '42 Academic Avenue, Tech City, Bangalore',
      departmentId: deptBCA.id,
      course: 'Bachelor of Computer Applications',
      semester: 1,
      section: 'A',
      status: 'Active',
      userId: studentUser1.id,
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'sneha.gupta@edumanage.com',
      name: 'Sneha Gupta',
      password: studentHashedPassword,
      role: Role.STUDENT,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      studentId: 'STU-2024-002',
      firstName: 'Sneha',
      lastName: 'Gupta',
      email: 'sneha.gupta@edumanage.com',
      phone: '+91 91234 56790',
      dateOfBirth: new Date('2003-09-22'),
      gender: 'Female',
      address: '15 Lotus Residency, Indiranagar, Bangalore',
      departmentId: deptBCA.id,
      course: 'Bachelor of Computer Applications',
      semester: 1,
      section: 'A',
      status: 'Active',
      userId: studentUser2.id,
    },
  });

  const studentUser3 = await prisma.user.create({
    data: {
      email: 'amit.kumar@edumanage.com',
      name: 'Amit Kumar',
      password: studentHashedPassword,
      role: Role.STUDENT,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      studentId: 'STU-2024-003',
      firstName: 'Amit',
      lastName: 'Kumar',
      email: 'amit.kumar@edumanage.com',
      phone: '+91 91234 56791',
      dateOfBirth: new Date('2002-11-10'),
      gender: 'Male',
      address: '77 Silicon Park, Electronic City, Bangalore',
      departmentId: deptBCA.id,
      course: 'Bachelor of Computer Applications',
      semester: 1,
      section: 'B',
      status: 'Active',
      userId: studentUser3.id,
    },
  });

  const studentUser4 = await prisma.user.create({
    data: {
      email: 'pooja.singh@edumanage.com',
      name: 'Pooja Singh',
      password: studentHashedPassword,
      role: Role.STUDENT,
    },
  });

  const student4 = await prisma.student.create({
    data: {
      studentId: 'STU-2024-004',
      firstName: 'Pooja',
      lastName: 'Singh',
      email: 'pooja.singh@edumanage.com',
      phone: '+91 91234 56792',
      dateOfBirth: new Date('2003-04-18'),
      gender: 'Female',
      address: '88 MG Road, Central, Bangalore',
      departmentId: deptBBA.id,
      course: 'Bachelor of Business Administration',
      semester: 1,
      section: 'A',
      status: 'Active',
      userId: studentUser4.id,
    },
  });

  // 6. Attendance records
  console.log('Seeding Attendance Records...');
  const attendanceDates = [
    new Date('2024-09-02'),
    new Date('2024-09-03'),
    new Date('2024-09-04'),
    new Date('2024-09-05'),
    new Date('2024-09-06'),
    new Date('2024-09-09'),
    new Date('2024-09-10'),
    new Date('2024-09-11'),
    new Date('2024-09-12'),
    new Date('2024-09-13'),
  ];

  for (let i = 0; i < attendanceDates.length; i++) {
    const d = attendanceDates[i];
    // Student 1 (Rahul)
    await prisma.attendance.create({
      data: {
        studentId: student1.id,
        subjectId: subWebDev.id,
        teacherId: teacher1.id,
        date: d,
        status: i === 4 ? AttendanceStatus.LATE : i === 8 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
      },
    });

    // Student 2 (Sneha)
    await prisma.attendance.create({
      data: {
        studentId: student2.id,
        subjectId: subWebDev.id,
        teacherId: teacher1.id,
        date: d,
        status: AttendanceStatus.PRESENT,
      },
    });

    // Student 3 (Amit)
    await prisma.attendance.create({
      data: {
        studentId: student3.id,
        subjectId: subWebDev.id,
        teacherId: teacher1.id,
        date: d,
        status: i % 3 === 0 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
      },
    });
  }

  // 7. Exams
  console.log('Seeding Exams & Results...');
  const exam1 = await prisma.exam.create({
    data: {
      examCode: 'EXAM-2024-BCA101-MID',
      name: 'Mid-Term Examination: Web Development',
      departmentId: deptBCA.id,
      subjectId: subWebDev.id,
      semester: 1,
      examDate: new Date('2024-10-15T10:00:00Z'),
      startTime: '10:00 AM',
      durationMinutes: 180,
      maxMarks: 100,
      passMarks: 40,
    },
  });

  const exam2 = await prisma.exam.create({
    data: {
      examCode: 'EXAM-2024-BCA102-MID',
      name: 'Mid-Term Examination: Data Structures',
      departmentId: deptBCA.id,
      subjectId: subDSA.id,
      semester: 1,
      examDate: new Date('2024-10-18T10:00:00Z'),
      startTime: '10:00 AM',
      durationMinutes: 180,
      maxMarks: 100,
      passMarks: 40,
    },
  });

  // Results for Exam 1
  await prisma.examResult.createMany({
    data: [
      {
        examId: exam1.id,
        studentId: student1.id,
        marksObtained: 88,
        maxMarks: 100,
        percentage: 88,
        grade: 'A',
        status: 'PASS',
        remarks: 'Excellent practical and theoretical grasp',
      },
      {
        examId: exam1.id,
        studentId: student2.id,
        marksObtained: 94,
        maxMarks: 100,
        percentage: 94,
        grade: 'A+',
        status: 'PASS',
        remarks: 'Outstanding performance',
      },
      {
        examId: exam1.id,
        studentId: student3.id,
        marksObtained: 68,
        maxMarks: 100,
        percentage: 68,
        grade: 'C',
        status: 'PASS',
        remarks: 'Good effort, needs improvement in state management',
      },
    ],
  });

  // Results for Exam 2
  await prisma.examResult.createMany({
    data: [
      {
        examId: exam2.id,
        studentId: student1.id,
        marksObtained: 92,
        maxMarks: 100,
        percentage: 92,
        grade: 'A+',
        status: 'PASS',
        remarks: 'Flawless algorithm implementation',
      },
      {
        examId: exam2.id,
        studentId: student2.id,
        marksObtained: 82,
        maxMarks: 100,
        percentage: 82,
        grade: 'A',
        status: 'PASS',
        remarks: 'Very solid understanding of binary trees',
      },
      {
        examId: exam2.id,
        studentId: student3.id,
        marksObtained: 55,
        maxMarks: 100,
        percentage: 55,
        grade: 'D',
        status: 'PASS',
        remarks: 'Passed, revise dynamic programming',
      },
    ],
  });

  // 8. Fee Structure & Payments
  console.log('Seeding Fee Structures & Payments...');
  const feeBCA = await prisma.feeStructure.create({
    data: {
      name: 'BCA Semester 1 Tuition Fee',
      departmentId: deptBCA.id,
      academicYear: '2024-2025',
      semester: 1,
      totalAmount: 45000,
      dueDate: new Date('2024-11-30'),
    },
  });

  const feeBBA = await prisma.feeStructure.create({
    data: {
      name: 'BBA Semester 1 Tuition Fee',
      departmentId: deptBBA.id,
      academicYear: '2024-2025',
      semester: 1,
      totalAmount: 40000,
      dueDate: new Date('2024-11-30'),
    },
  });

  await prisma.feePayment.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      studentId: student1.id,
      feeStructureId: feeBCA.id,
      academicYear: '2024-2025',
      semester: 1,
      totalFee: 45000,
      amountPaid: 30000,
      remainingAmount: 15000,
      paymentStatus: PaymentStatus.PARTIAL,
      paymentMethod: 'Online / Card',
      paymentDate: new Date('2024-08-15'),
      notes: 'Initial installment paid via net banking',
    },
  });

  await prisma.feePayment.create({
    data: {
      invoiceNumber: 'INV-2024-002',
      studentId: student2.id,
      feeStructureId: feeBCA.id,
      academicYear: '2024-2025',
      semester: 1,
      totalFee: 45000,
      amountPaid: 45000,
      remainingAmount: 0,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'Bank Transfer',
      paymentDate: new Date('2024-08-10'),
      notes: 'Full payment received',
    },
  });

  await prisma.feePayment.create({
    data: {
      invoiceNumber: 'INV-2024-003',
      studentId: student3.id,
      feeStructureId: feeBCA.id,
      academicYear: '2024-2025',
      semester: 1,
      totalFee: 45000,
      amountPaid: 0,
      remainingAmount: 45000,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: 'Pending',
      paymentDate: null,
      notes: 'Fee payment reminder sent',
    },
  });

  await prisma.feePayment.create({
    data: {
      invoiceNumber: 'INV-2024-004',
      studentId: student4.id,
      feeStructureId: feeBBA.id,
      academicYear: '2024-2025',
      semester: 1,
      totalFee: 40000,
      amountPaid: 40000,
      remainingAmount: 0,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'Online / UPI',
      paymentDate: new Date('2024-08-20'),
      notes: 'Paid via UPI reference #9812491',
    },
  });

  // 9. Academic Records
  console.log('Seeding Academic Records...');
  await prisma.academicRecord.create({
    data: {
      studentId: student1.id,
      academicYear: '2024-2025',
      semester: 1,
      totalSubjects: 3,
      totalCredits: 11,
      gpa: 8.9,
      cgpa: 8.9,
      attendancePercentage: 80.0,
      overallGrade: 'A',
      status: 'Completed',
    },
  });

  await prisma.academicRecord.create({
    data: {
      studentId: student2.id,
      academicYear: '2024-2025',
      semester: 1,
      totalSubjects: 3,
      totalCredits: 11,
      gpa: 9.3,
      cgpa: 9.3,
      attendancePercentage: 100.0,
      overallGrade: 'A+',
      status: 'Completed',
    },
  });

  console.log('=============================================');
  console.log('EduManage Seed Completed Successfully!');
  console.log('Demo Credentials:');
  console.log('Admin:   admin@edumanage.com   / Admin@123');
  console.log('Teacher: teacher@edumanage.com / Teacher@123');
  console.log('Student: student@edumanage.com / Student@123');
  console.log('=============================================');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
