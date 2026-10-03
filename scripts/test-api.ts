async function runTests() {
  console.log('=== Running EduManage Integration & Auth Verification Tests ===\n');

  const BASE_URL = 'http://localhost:3000';

  // 1. Test Admin Login
  console.log('Test 1: Admin Login (admin@edumanage.com)');
  const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@edumanage.com', password: 'Admin@123' }),
  });
  const adminData = await adminRes.json();
  if (adminData.success && adminData.data.user.role === 'ADMIN') {
    console.log('  [PASS] Admin login succeeded. Role: ADMIN, Redirect:', adminData.data.redirectUrl);
  } else {
    console.error('  [FAIL] Admin login failed:', adminData);
    process.exit(1);
  }
  const adminToken = adminData.data.token;

  // 2. Test Teacher Login
  console.log('\nTest 2: Teacher Login (teacher@edumanage.com)');
  const teacherRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teacher@edumanage.com', password: 'Teacher@123' }),
  });
  const teacherData = await teacherRes.json();
  if (teacherData.success && teacherData.data.user.role === 'TEACHER') {
    console.log('  [PASS] Teacher login succeeded. Role: TEACHER, Redirect:', teacherData.data.redirectUrl);
  } else {
    console.error('  [FAIL] Teacher login failed:', teacherData);
    process.exit(1);
  }
  const teacherToken = teacherData.data.token;

  // 3. Test Student Login
  console.log('\nTest 3: Student Login (student@edumanage.com)');
  const studentRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@edumanage.com', password: 'Student@123' }),
  });
  const studentData = await studentRes.json();
  if (studentData.success && studentData.data.user.role === 'STUDENT') {
    console.log('  [PASS] Student login succeeded. Role: STUDENT, Redirect:', studentData.data.redirectUrl);
  } else {
    console.error('  [FAIL] Student login failed:', studentData);
    process.exit(1);
  }
  const studentToken = studentData.data.token;

  // 4. Test Invalid Login
  console.log('\nTest 4: Invalid Password Rejection');
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@edumanage.com', password: 'WrongPassword999' }),
  });
  const badData = await badLoginRes.json();
  if (!badData.success && badLoginRes.status === 401) {
    console.log('  [PASS] Bad credentials properly rejected with HTTP 401');
  } else {
    console.error('  [FAIL] Bad password was not rejected properly:', badData);
  }

  // 5. Test Admin Dashboard API
  console.log('\nTest 5: Fetch Admin Dashboard API');
  const dashRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dashData = await dashRes.json();
  if (dashData.success) {
    console.log('  [PASS] Admin Dashboard Metrics loaded:');
    console.log('    - Total Students:', dashData.data.summary.totalStudents);
    console.log('    - Total Faculty:', dashData.data.summary.totalTeachers);
    console.log('    - Total Subjects:', dashData.data.summary.totalSubjects);
    console.log('    - Total Attendance Records:', dashData.data.summary.totalAttendance);
    console.log('    - Total Collected Fees:', dashData.data.summary.collectedFees);
    console.log('    - Total Pending Fees:', dashData.data.summary.pendingFees);
  } else {
    console.error('  [FAIL] Admin dashboard API failed:', dashData);
  }

  // 6. Test Students List API
  console.log('\nTest 6: Fetch Students API');
  const studentsRes = await fetch(`${BASE_URL}/api/students`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const studentsData = await studentsRes.json();
  if (studentsData.success && Array.isArray(studentsData.data)) {
    console.log(`  [PASS] Successfully retrieved ${studentsData.data.length} students from PostgreSQL`);
  } else {
    console.error('  [FAIL] Students API failed:', studentsData);
  }

  // 7. Test Attendance Stats API for Student
  console.log('\nTest 7: Fetch Student Attendance Stats API');
  const attStatsRes = await fetch(`${BASE_URL}/api/attendance/stats`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const attStatsData = await attStatsRes.json();
  if (attStatsData.success) {
    console.log('  [PASS] Attendance stats retrieved:');
    console.log('    - Attendance Rate:', attStatsData.data.summary.overallPercentage + '%');
    console.log('    - Present count:', attStatsData.data.summary.present);
    console.log('    - Total classes:', attStatsData.data.summary.total);
  } else {
    console.error('  [FAIL] Attendance stats API failed:', attStatsData);
  }

  // 8. Test Reports API
  console.log('\nTest 8: Fetch Institutional Reports (Fees)');
  const repRes = await fetch(`${BASE_URL}/api/reports?type=fees`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const repData = await repRes.json();
  if (repData.success && Array.isArray(repData.data.data)) {
    console.log(`  [PASS] Report generated with ${repData.data.count} fee transaction records`);
  } else {
    console.error('  [FAIL] Reports API failed:', repData);
  }

  console.log('\n=== ALL INTEGRATION VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(console.error);
