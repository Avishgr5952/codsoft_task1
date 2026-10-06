async function testFull() {
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@edumanage.com', password: 'Admin@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  console.log('Login status:', loginRes.status, 'Token acquired:', !!token);

  if (!token) {
    console.error('Failed to get token:', loginData);
    return;
  }

  const cookie = 'edumanage_token=' + token;
  const headers = { 'Cookie': cookie, 'Authorization': 'Bearer ' + token };

  const apis = [
    '/api/dashboard/admin',
    '/api/students',
    '/api/teachers',
    '/api/departments',
    '/api/subjects',
    '/api/exams',
    '/api/fees',
    '/api/records'
  ];

  for (const api of apis) {
    try {
      const res = await fetch('http://localhost:3001' + api, { headers });
      const json = await res.json().catch(() => null);
      console.log(api, '-> Status:', res.status, 'Success:', json?.success);
    } catch (e: any) {
      console.error(api, '-> Error:', e.message);
    }
  }

  const pages = [
    '/admin/dashboard',
    '/admin/students',
    '/admin/teachers',
    '/admin/departments',
    '/admin/subjects',
    '/admin/attendance',
    '/admin/examinations',
    '/admin/fees',
    '/admin/records',
    '/admin/reports',
    '/admin/settings'
  ];

  // Teacher Test
  const teacherLogin = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teacher@edumanage.com', password: 'Teacher@123' })
  });
  const teacherData = await teacherLogin.json();
  console.log('Teacher Login:', teacherLogin.status, 'Success:', teacherData.success);

  // Student Test
  const studentLogin = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@edumanage.com', password: 'Student@123' })
  });
  const studentData = await studentLogin.json();
  console.log('Student Login:', studentLogin.status, 'Success:', studentData.success);
}

testFull().catch(console.error);

