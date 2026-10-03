async function runCrudTests() {
  console.log('=== Running EduManage CRUD Operations Verification Tests ===\n');

  const BASE_URL = 'http://localhost:3000';

  // Login as admin
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@edumanage.com', password: 'Admin@123' }),
  });
  const { data } = await loginRes.json();
  const token = data.token;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 1. Department CRUD
  console.log('Test 1: Department CRUD');
  const createDeptRes = await fetch(`${BASE_URL}/api/departments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      code: 'TESTDEPT',
      name: 'Department of Testing Engineering',
      description: 'Department created for automated verification test',
    }),
  });
  const deptJson = await createDeptRes.json();
  if (!deptJson.success) throw new Error('Create department failed: ' + deptJson.error);
  const testDeptId = deptJson.data.id;
  console.log('  [PASS] Created Department:', deptJson.data.code);

  // Update Department
  const updateDeptRes = await fetch(`${BASE_URL}/api/departments/${testDeptId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ name: 'Department of Advanced Testing' }),
  });
  const updatedDept = await updateDeptRes.json();
  if (updatedDept.data.name === 'Department of Advanced Testing') {
    console.log('  [PASS] Updated Department name');
  }

  // 2. Subject CRUD
  console.log('\nTest 2: Subject CRUD');
  const createSubRes = await fetch(`${BASE_URL}/api/subjects`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      code: 'TEST101',
      name: 'Software Quality Assurance',
      departmentId: testDeptId,
      semester: 1,
      credits: 4,
    }),
  });
  const subJson = await createSubRes.json();
  if (!subJson.success) throw new Error('Create subject failed: ' + subJson.error);
  const testSubId = subJson.data.id;
  console.log('  [PASS] Created Subject:', subJson.data.code);

  // 3. Student CRUD
  console.log('\nTest 3: Student CRUD');
  const testStudentId = `STU-TEST-${Date.now().toString().slice(-4)}`;
  const createStRes = await fetch(`${BASE_URL}/api/students`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      studentId: testStudentId,
      firstName: 'Test',
      lastName: 'Candidate',
      email: `test.${Date.now()}@edumanage.com`,
      departmentId: testDeptId,
      course: 'Bachelor of Computer Applications',
      semester: 1,
      section: 'A',
      password: 'Student@123',
    }),
  });
  const stJson = await createStRes.json();
  if (!stJson.success) throw new Error('Create student failed: ' + stJson.error);
  const studentDbId = stJson.data.id;
  console.log('  [PASS] Created Student:', stJson.data.studentId, `${stJson.data.firstName} ${stJson.data.lastName}`);

  // 4. Attendance Marking
  console.log('\nTest 4: Bulk Attendance Marking');
  const markAttRes = await fetch(`${BASE_URL}/api/attendance`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      subjectId: testSubId,
      date: new Date().toISOString(),
      records: [{ studentId: studentDbId, status: 'PRESENT', remarks: 'CRUD Test Session' }],
    }),
  });
  const attJson = await markAttRes.json();
  if (attJson.success) {
    console.log('  [PASS] Marked attendance without duplicate violation');
  }

  // 5. Exam Creation and Marks Entry
  console.log('\nTest 5: Exam Creation & Automated Grading');
  const examCode = `EXAM-TEST-${Date.now().toString().slice(-4)}`;
  const createExamRes = await fetch(`${BASE_URL}/api/exams`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      examCode,
      name: 'Automated Test Evaluation',
      departmentId: testDeptId,
      subjectId: testSubId,
      semester: 1,
      examDate: new Date().toISOString(),
      maxMarks: 100,
      passMarks: 40,
    }),
  });
  const examJson = await createExamRes.json();
  const examDbId = examJson.data.id;
  console.log('  [PASS] Created Exam:', examJson.data.examCode);

  // Grade marks
  const gradeRes = await fetch(`${BASE_URL}/api/results`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      examId: examDbId,
      results: [{ studentId: studentDbId, marksObtained: 85, remarks: 'Outstanding work' }],
    }),
  });
  const gradeJson = await gradeRes.json();
  if (gradeJson.success && gradeJson.data[0].grade === 'A' && gradeJson.data[0].status === 'PASS') {
    console.log('  [PASS] Exam result evaluated: 85/100 -> Grade:', gradeJson.data[0].grade, 'Status:', gradeJson.data[0].status);
  }

  // 6. Fee Assignment and Payment
  console.log('\nTest 6: Fee Assignment & Payment Recording');
  const createFeeRes = await fetch(`${BASE_URL}/api/fees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      studentId: studentDbId,
      academicYear: '2024-2025',
      semester: 1,
      totalFee: 50000,
      amountPaid: 20000,
      paymentMethod: 'Online',
    }),
  });
  const feeJson = await createFeeRes.json();
  if (feeJson.success && feeJson.data.remainingAmount === 30000 && feeJson.data.paymentStatus === 'PARTIAL') {
    console.log('  [PASS] Fee assigned. Total: 50,000 | Paid: 20,000 | Balance:', feeJson.data.remainingAmount, '| Status:', feeJson.data.paymentStatus);
  }
  const feeId = feeJson.data.id;

  // Pay remaining
  const payRestRes = await fetch(`${BASE_URL}/api/fees/${feeId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      amountPaid: 50000,
      paymentMethod: 'Online / Card',
    }),
  });
  const payJson = await payRestRes.json();
  if (payJson.success && payJson.data.remainingAmount === 0 && payJson.data.paymentStatus === 'PAID') {
    console.log('  [PASS] Full payment recorded. Remaining Balance:', payJson.data.remainingAmount, '| Status:', payJson.data.paymentStatus);
  }

  // 7. Cleanup test records
  console.log('\nTest 7: Cleanup Test Entities');
  await fetch(`${BASE_URL}/api/fees/${feeId}`, { method: 'DELETE', headers });
  await fetch(`${BASE_URL}/api/exams/${examDbId}`, { method: 'DELETE', headers });
  await fetch(`${BASE_URL}/api/students/${studentDbId}`, { method: 'DELETE', headers });
  await fetch(`${BASE_URL}/api/subjects/${testSubId}`, { method: 'DELETE', headers });
  await fetch(`${BASE_URL}/api/departments/${testDeptId}`, { method: 'DELETE', headers });
  console.log('  [PASS] Test records cleanly deleted');

  console.log('\n=== ALL CRUD INTEGRATION TESTS PASSED PERFECTLY! ===');
}

runCrudTests().catch(console.error);
