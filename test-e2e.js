// test-e2e.js - End-to-End Test Suite using Node 24 native fetch
const API = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, ok: res.ok, data };
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('   CarePoint Hospital Management System - Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('\n--- 1. Testing Health Endpoint ---');
    const health = await request(`${API}/health`);
    assert(health.status === 200 && health.data.status === 'healthy', 'API health check healthy');

    // 2. Authentication: Admin, Doctor, Patient Logins
    console.log('\n--- 2. Testing Authentication ---');
    const adminLogin = await request(`${API}/auth/login`, {
      method: 'POST',
      body: { email: 'admin@carepoint.com', password: 'Admin@1234' },
    });
    assert(adminLogin.data.success && adminLogin.data.user.role === 'admin', 'Admin login successful');
    const adminToken = adminLogin.data.token;

    const doctorLogin = await request(`${API}/auth/login`, {
      method: 'POST',
      body: { email: 'dr.reynolds@carepoint.com', password: 'Doctor@1234' },
    });
    assert(doctorLogin.data.success && doctorLogin.data.user.role === 'doctor', 'Doctor login successful');
    const doctorToken = doctorLogin.data.token;

    const patientLogin = await request(`${API}/auth/login`, {
      method: 'POST',
      body: { email: 'patient@carepoint.com', password: 'Patient@1234' },
    });
    assert(patientLogin.data.success && patientLogin.data.user.role === 'patient', 'Patient login successful');
    const patientToken = patientLogin.data.token;

    // Verify /api/auth/me
    const meRes = await request(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(meRes.data.user.email === 'admin@carepoint.com', '/api/auth/me returns valid user data');

    // 3. New Patient Registration
    console.log('\n--- 3. Testing Patient Registration ---');
    const testPatientEmail = `test.patient.${Date.now()}@example.com`;
    const regRes = await request(`${API}/auth/register`, {
      method: 'POST',
      body: {
        name: 'Alice Cooper',
        email: testPatientEmail,
        password: 'Password@123',
        phone: '+1 (555) 777-8899',
        gender: 'female',
        bloodGroup: 'B+',
        address: '123 Test Street, New York',
      },
    });
    assert(regRes.data.success && regRes.data.user.role === 'patient', 'New patient registration succeeded with role: patient');
    const newPatientToken = regRes.data.token;

    // 4. Department Endpoints
    console.log('\n--- 4. Testing Departments ---');
    const depts = await request(`${API}/departments`);
    assert(depts.data.success && depts.data.count >= 10, `Retrieved ${depts.data.count} clinical departments`);

    const cardioDept = depts.data.data.find((d) => d.name === 'Cardiology');
    assert(cardioDept && cardioDept.doctorCount >= 1, 'Cardiology department populated with doctor counts');

    // Admin creates test department
    const newDeptRes = await request(`${API}/departments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: `Endocrinology ${Date.now()}`,
        description: 'Hormonal and diabetic care',
        icon: 'Activity',
      },
    });
    assert(newDeptRes.data.success, 'Admin created new department');
    const createdDeptId = newDeptRes.data.data._id;

    // Admin deletes test department
    const delDeptRes = await request(`${API}/departments/${createdDeptId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delDeptRes.data.success, 'Admin deleted unused department');

    // 5. Doctor Endpoints & Slot Availability
    console.log('\n--- 5. Testing Doctors & Slot Engine ---');
    const docs = await request(`${API}/doctors?sortBy=rating`);
    assert(docs.data.success && docs.data.total >= 6, `Retrieved ${docs.data.total} doctors sorted by rating`);

    // Select Dr. Reynolds who matches doctorToken
    const testDoctor = docs.data.data.find((d) => d.user?.email === 'dr.reynolds@carepoint.com');
    assert(testDoctor !== undefined, 'Found Dr. Reynolds in directory');

    // Pick Wednesday 2026-11-25 (a verified working day for Dr. Reynolds)
    const testDate = '2026-11-25';
    const slotsRes = await request(`${API}/doctors/${testDoctor._id}/slots?date=${testDate}`);
    assert(slotsRes.data.success && Array.isArray(slotsRes.data.slots), 'Doctor slot engine returns slots array');
    assert(slotsRes.data.isWorkingDay === true, 'Verified doctor is working on test date');

    // 6. Appointment Booking & Duplicate Booking Prevention
    console.log('\n--- 6. Testing Appointment Booking & Duplicate Prevention ---');
    const openSlot = slotsRes.data.slots.find((s) => s.isAvailable);
    const chosenTime = openSlot ? openSlot.time : '11:00 AM';

    const bookingRes = await request(`${API}/appointments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newPatientToken}` },
      body: {
        doctorId: testDoctor._id,
        appointmentDate: testDate,
        appointmentTime: chosenTime,
        reason: 'Severe recurring chest tightness and shortness of breath',
        notes: 'Has family history of coronary artery disease',
      },
    });
    assert(bookingRes.data.success && bookingRes.data.data.status === 'pending', 'Patient booked appointment successfully');
    const appointmentId = bookingRes.data.data?._id;

    // DUPLICATE ATTEMPT: Attempt to book the EXACT SAME doctor, date, and slot
    const duplicateRes = await request(`${API}/appointments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: {
        doctorId: testDoctor._id,
        appointmentDate: testDate,
        appointmentTime: chosenTime,
        reason: 'Attempting duplicate booking in occupied slot',
      },
    });
    assert(
      duplicateRes.status === 400 && duplicateRes.data.success === false,
      `Duplicate booking correctly rejected with 400: "${duplicateRes.data.message}"`
    );

    // Past Date Booking Prevention Test
    const pastRes = await request(`${API}/appointments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: {
        doctorId: testDoctor._id,
        appointmentDate: '2020-01-01',
        appointmentTime: '10:00 AM',
        reason: 'Past date attempt',
      },
    });
    assert(
      pastRes.status === 400 && pastRes.data.success === false,
      `Past date booking correctly rejected with 400: "${pastRes.data.message}"`
    );

    // 7. Status Transitions & Clinical Notes
    console.log('\n--- 7. Testing Appointment Status Updates & Notes ---');
    // Approve appointment
    const approveRes = await request(`${API}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'approved' },
    });
    assert(approveRes.data.data.status === 'approved', 'Appointment approved');

    // Add Doctor Clinical Notes & Prescription
    const notesRes = await request(`${API}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: {
        doctorNotes: 'ECG performed. Sinus rhythm normal. Mild costochondritis suspected.',
        prescription: 'Ibuprofen 400mg PO TID with meals x 5 days. Warm compress.',
      },
    });
    assert(
      notesRes.data.data.prescription.includes('Ibuprofen'),
      'Doctor added clinical notes & prescription'
    );

    // Mark as Completed
    const completeRes = await request(`${API}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'completed' },
    });
    assert(completeRes.data.data.status === 'completed', 'Appointment completed & patient treated');

    // 8. Dashboard Analytics & Stats
    console.log('\n--- 8. Testing Dashboard Analytics ---');
    const statsRes = await request(`${API}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(statsRes.data.success && statsRes.data.data.totalAppointments > 0, 'Admin stats retrieved successfully');

    const analyticsRes = await request(`${API}/dashboard/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      analyticsRes.data.success &&
        Array.isArray(analyticsRes.data.data.statusChart) &&
        Array.isArray(analyticsRes.data.data.weeklyTrend),
      'Admin analytics charts data returned valid structure'
    );

    console.log('\n======================================================');
    console.log(`Test Execution Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('Test Suite encountered unhandled error:', error.message);
    process.exit(1);
  }
}

runTestSuite();
