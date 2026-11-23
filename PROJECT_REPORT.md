# CAREPOINT
## A Smart Hospital Appointment Management System

---

# PROJECT REPORT

**Submitted in partial fulfilment of the requirements for the award of the degree of**  
### MASTER OF COMPUTER APPLICATIONS (MCA) / BACHELOR OF ENGINEERING  
**Academic Year: 2026–2027**

<br>

**Submitted by**  
### Punith Bannur  
**1CR25MC057**  
*Department of Computer Applications / Computer Science*  
*CMR Institute of Technology*  

<br>

**Guided by**  
### Prof. Daya Thummar  
*Department of Computer Applications*  

<br><br>

**CAREPOINT | PAGE 1**

---

<div style="page-break-after: always;"></div>

**CAREPOINT | PAGE 2**

# PROJECT REPORT
## CAREPOINT
### A Smart Hospital Appointment Management System
Submitted in partial fulfilment of the requirements for the award of the degree of  
**MASTER OF COMPUTER APPLICATIONS (MCA)**  
Academic Year: 2026–2027

---

### ABSTRACT
**CarePoint** is a modern, enterprise-grade web application developed to eliminate scheduling friction, hospital wait times, and administrative fragmentation in healthcare institutions. The platform provides a centralized, role-based ecosystem connecting Patients, Medical Specialists, and Hospital Administrators. Patients can discover board-certified physicians across specialized medical departments, inspect real-time consultation fees and verified ratings, and reserve verified appointments with automated duplicate booking prevention. Physicians receive a dedicated clinical portal to review today's patient queue, track patient medical histories, manage consultation time slots, and issue electronic prescriptions. Administrators manage hospital resources, oversee physician rosters, monitor clinical departments, and analyze hospital throughput through interactive visual analytics. Built with a React 19 frontend, Tailwind CSS, an Express.js and Node.js backend, and a persistent MongoDB database with Mongoose schemas, CarePoint delivers a reliable, HIPAA-inspired, cloud-ready healthcare SaaS solution.

---

### 1. INTRODUCTION
Modern healthcare facilities operate across diverse departments—including Cardiology, Neurology, Orthopedics, Pediatrics, and General Medicine. In traditional hospital setups, appointment scheduling and patient records are frequently maintained through disconnected spreadsheets, paper charts, or siloed departmental desks. This fragmentation causes long waiting room congestion, schedule overlaps, double bookings, and delayed treatments. CarePoint addresses these operational bottlenecks by providing a unified digital portal for scheduling, clinical workflow management, and operational analytics.

#### 1.1 Problem Statement
Manual and decentralized hospital booking systems suffer from lack of live schedule visibility, leading to duplicate appointments for the same physician slot, patient record misplacement, and poor utilization of clinic hours. Patients struggle to identify physician availability, while doctors lack streamlined tools to review medical histories and manage their daily appointment queue. A unified, secure, role-based digital management system is therefore essential.

#### 1.2 Objectives
- Provide an intuitive, searchable directory of medical specialists categorized by clinical department.
- Implement an automated slot availability engine with strict duplicate booking prevention.
- Enable secure role-based authentication (Admin, Doctor, Patient) using JWT and bcrypt.
- Provide physicians with a dedicated clinical portal for queue management, electronic prescriptions, and availability configuration.
- Provide administrators with tools for doctor CRUD, patient record oversight, department management, and operational analytics.
- Ensure end-to-end data integrity, HIPAA-aligned record confidentiality, and cloud deployment readiness.

#### 1.3 Scope and Users
The project spans the full lifecycle of outpatient hospital appointments: discovery, booking, status transitions (Pending, Approved, Completed, Cancelled, Rejected), clinical documentation, and hospital-wide analytics. 
- **Patient Role**: Explores specialist doctors, books consultation slots, reschedules or cancels visits, reviews electronic prescriptions, and maintains personal health profiles (blood group, allergies, emergency contacts).
- **Doctor Role**: Inspects today's patient queue, sets working weekdays and consultation time slots, adds diagnostic notes and prescriptions, and reviews patient medical histories.
- **Administrator Role**: Governs hospital medical staff, oversees patient charts, manages clinical departments, and monitors hospital performance through interactive Recharts analytics.

#### 1.4 Expected Outcome
A production-grade, portfolio-ready web platform that automates appointment scheduling, prevents double-booking conflicts, consolidates electronic medical records, and provides transparent visibility into hospital clinical throughput.

#### 1.5 Significance of the Project
CarePoint significantly reduces patient wait times from hours to minutes, optimizes hospital resource allocation, and ensures accurate clinical documentation. Automated slot verification eliminates double-booked consultations, and digital health records ensure that allergies and prior conditions are immediately visible to treating physicians.

#### 1.6 Intended Users
The system serves three primary user groups:
1. **Patients**: Individuals scheduling medical consultations and accessing digital care records.
2. **Medical Specialists / Doctors**: Attending physicians managing their daily clinical queues and practice schedules.
3. **Hospital Administrators**: Executive and departmental staff overseeing clinical throughput, staff rosters, and facility operations.

---

<div style="page-break-after: always;"></div>

**CAREPOINT | PAGE 3**

### 2. SYSTEM ANALYSIS AND REQUIREMENTS

#### 2.1 Existing System
Conventional hospital workflows rely on physical reception counters, phone calls, or disconnected legacy software. Patient records are often stored on paper charts or isolated desktop applications. This leads to:
- High rates of double-booking and schedule collisions.
- Prolonged waiting room congestion and patient frustration.
- Lost or uncoordinated medical histories, allergy warnings, and prescriptions.
- Absence of real-time operational analytics for hospital leadership.

#### 2.2 Proposed System
CarePoint replaces manual processes with a responsive, cloud-based platform. Key innovations include:
- A real-time calendar synchronization engine that queries slot availability before booking.
- Immediate duplicate booking rejection at both the API and database levels.
- Role-segregated navigation and dashboards tailored to Patients, Doctors, and Administrators.
- Electronic recordkeeping for prescriptions, medical history, and emergency contacts.
- Real-time data visualization of hospital patient flow and department caseloads.

#### 2.3 Functional Requirements
- **Authentication**: JWT-based login, role validation, patient self-registration, and profile updates.
- **Doctor Directory**: Search by doctor name or specialty, filter by department and availability, sort by experience or fees.
- **Smart Booking System**: Select department, doctor, date, and verified open slot; record visit reason and patient notes.
- **Duplicate Prevention**: Rejection of overlapping bookings for the same doctor, date, and time.
- **Appointment Management**: Multi-state workflow (Pending → Approved → Completed / Cancelled / Rejected).
- **Clinical Charting**: Physician entry of clinical observations and electronic prescriptions.
- **Schedule Management**: Physician customization of active weekdays, custom slot times, and availability status.
- **Department Management**: Administrative CRUD for hospital departments and leadership.
- **Analytics & Reporting**: Interactive Recharts for weekly volume, status distribution, and department metrics.

#### 2.4 Non-Functional Requirements
- **Security**: Passwords hashed with salted bcrypt rounds; JWT bearer authentication; strict role-based route protection.
- **Reliability & Consistency**: Mongoose compound indexing on `{ doctor, appointmentDate, appointmentTime }` prevents concurrent double-bookings.
- **Maintainability**: Modular architecture separating React components, contexts, layouts, Express controllers, routes, and models.
- **Usability & Aesthetics**: Healthcare SaaS design palette (Primary `#2563EB`, Secondary `#0F766E`, Dark `#0F172A`, Background `#F8FAFC`), skeleton loaders, and toast notifications.
- **Responsiveness**: Mobile-first responsive UI supporting smartphones, tablets, and desktop displays.

#### 2.5 Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, Vite, React Router v7 | Single Page Application with dynamic routing |
| **Styling & Icons** | Tailwind CSS 3.4, Lucide React | Modern healthcare design tokens and iconography |
| **Charts & Visuals** | Recharts 2.15 | Interactive AreaCharts, Donut Charts, and BarCharts |
| **Backend Runtime** | Node.js (v24), Express.js (v4) | RESTful API architecture and routing |
| **Database** | MongoDB & Mongoose 8 | Document storage with schema validation & indexing |
| **Authentication** | JWT, bcryptjs | Stateless token auth & cryptographic password hashing |
| **Testing & Tools** | Node.js Native E2E Test Suite | 22-step automated verification suite |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas | Cloud infrastructure with continuous deployment |

#### 2.6 Development Environment
The application is organized as a clean decoupled monorepo: `client/` for the Vite React frontend and `server/` for the Express backend. Local development utilizes a local MongoDB daemon or MongoDB Atlas cloud connection. Production builds utilize `client/vercel.json` for SPA routing and `render.yaml` for containerized backend execution.

#### 2.7 System Workflow
A patient registers an account or signs in. Upon selecting a medical specialty and doctor, the system executes an API call to `/api/doctors/:id/slots?date=YYYY-MM-DD`. The server inspects the doctor's working days and cross-references existing bookings to return open slots. When the patient confirms, a pending appointment is recorded. The assigned doctor reviews the booking on their dashboard, approves the consultation, examines the patient during the visit, and records clinical findings and electronic prescriptions before marking the visit as completed.

#### 2.8 Software and Hardware Requirements
- **Software**: Windows / Linux / macOS, Node.js (v18+), modern web browser (Chrome, Edge, Firefox), MongoDB (v6.0+ or Atlas).
- **Hardware**: Minimum 4 GB RAM (8 GB recommended), multi-core CPU, stable local or internet network connection.

---

<div style="page-break-after: always;"></div>

**CAREPOINT | PAGE 4**

### 3. SYSTEM DESIGN AND IMPLEMENTATION

#### 3.1 System Architecture
CarePoint employs a modern three-tier client-server architecture:

| Layer | Component | Responsibilities |
| :--- | :--- | :--- |
| **Presentation Tier** | React 19 SPA, Tailwind CSS | UI pages, forms, slot selection wizard, dashboards, Recharts |
| **Application Tier** | Express.js, REST Controllers | Authentication middleware, role authorization, slot verification engine, CRUD logic |
| **Data Tier** | MongoDB, Mongoose Models | Persistent storage for Users, Doctors, Patients, Departments, and Appointments |

#### 3.2 Database Design
- **User**: Stores name, email (unique, lowercase), password (hashed), role (`admin`, `doctor`, `patient`), phone, address, gender, dateOfBirth, status, avatar.
- **Doctor**: References User and Department; stores specialization, qualifications, experienceYears, consultationFee, rating, reviewCount, bio, availableDays (e.g. `['Monday', 'Wednesday']`), timeSlots (e.g. `['09:00 AM', '10:00 AM']`), isAvailable, roomNumber.
- **Patient**: References User; stores bloodGroup (`A+`, `O-`, etc.), allergies (`['Penicillin']`), medicalHistory (`['Asthma']`), emergencyContact (`name`, `phone`, `relationship`), insuranceProvider, insurancePolicyNumber.
- **Department**: Stores name, slug, description, icon (`Heart`, `Brain`, `Bone`, etc.), headDoctorName, image, isActive.
- **Appointment**: References Patient (User), Doctor, and Department; stores appointmentDate (`YYYY-MM-DD`), appointmentTime (`10:00 AM`), reason, status (`pending`, `approved`, `completed`, `cancelled`, `rejected`), notes, doctorNotes, prescription, fee, paymentStatus.
- **Compound Indexes**:
  - `{ doctor: 1, appointmentDate: 1, appointmentTime: 1 }`
  - `{ patient: 1, appointmentDate: 1 }`
  - `{ status: 1 }`

#### 3.3 Major Modules
1. **Authentication & Authorization**: Registration, login, profile management, and role-based route middleware (`protect`, `authorize`).
2. **Doctor Directory & Slot Engine**: Real-time evaluation of doctor working days and occupied slots.
3. **Appointment Lifecycle Engine**: Multi-state transitions, duplicate checking, reschedule handling, and cancellations.
4. **Clinical Charting & Prescriptions**: Physician documentation of diagnosis and pharmacological prescriptions.
5. **Administrative Management & Analytics**: CRUD for hospital staff and departments; Recharts metrics generation.

#### 3.4 Appointment Booking and Duplicate Prevention Logic
Duplicate prevention is enforced at multiple layers:
1. **Date Validation**: Ensures `appointmentDate >= today`. Past dates return `400 Bad Request`.
2. **Doctor Availability**: Day of week is derived from the date (`new Date(date).getDay()`) and matched against `doctor.availableDays`. Non-working days return an immediate error.
3. **Slot Conflict Query**: Before creating a booking, the backend queries:
   ```javascript
   const existing = await Appointment.findOne({
     doctor: doctorId,
     appointmentDate,
     appointmentTime,
     status: { $in: ['pending', 'approved'] }
   });
   if (existing) {
     return res.status(400).json({
       message: "This slot has already been reserved. Please select another time or date."
     });
   }
   ```
4. **Patient Overlap Check**: Validates that the patient does not hold another active consultation at the same time.

#### 3.5 API and Security Design
All endpoints follow REST principles:
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/doctors`, `GET /api/doctors/:id`, `GET /api/doctors/:id/slots`, `POST /api/doctors` (Admin), `PUT /api/doctors/:id`
- `GET /api/departments`, `POST /api/departments` (Admin), `PUT /api/departments/:id`, `DELETE /api/departments/:id`
- `GET /api/appointments`, `POST /api/appointments`, `PUT /api/appointments/:id`, `PUT /api/appointments/:id/reschedule`
- `GET /api/dashboard/stats`, `GET /api/dashboard/analytics`
Passwords are encrypted using 10 bcrypt salt rounds. Tokens are signed with HMAC SHA-256 and verified per request.

#### 3.6 Data Validation
Input validation is performed using Express Validator and Mongoose schema constraints. Email addresses are normalized to lowercase. Passwords require a minimum of 6 characters. Enumerated fields (roles, statuses, blood groups) strictly reject unexpected values.

#### 3.7 Reliability and Data Consistency
Relational integrity between User, Doctor, and Patient profiles is maintained via Mongoose `ObjectId` references. Deletion of departments with assigned doctors is blocked. Cancellation or completion releases the doctor's calendar slot for future appointments.

---

<div style="page-break-after: always;"></div>

**CAREPOINT | PAGE 5**

### 4. APPLICATION SCREENSHOTS & UI WALKTHROUGH

*High-resolution application screenshots captured live from the operational CarePoint system (stored in `screenshots/` and embedded in the generated PDF):*

- **Figure 4.1: Public Landing Page & Healthcare Hero Section** (`screenshots/01_landing_hero.png`)
  Modern healthcare SaaS landing page featuring hospital emergency hotline banner, value propositions, key clinical statistics (99.4% satisfaction, 50+ physicians, <15 min wait times), direct PDF download CTA, and specialist discovery.

- **Figure 4.2: Doctor Directory with Department Filters & Fee Schedule** (`screenshots/02_doctor_directory.png`)
  Searchable catalog featuring multi-criteria filtering by medical department, doctor name, and consultation fees. Doctor cards display verified credentials, room suites, star ratings, and 1-click booking triggers.

- **Figure 4.3: Doctor Dashboard with Consultation Queue & Practice Schedule** (`screenshots/06_doctor_dashboard.png`)
  Physician encounter portal showing today's appointments, upcoming patient consultations, quick action buttons (Accept, Reject, Complete), patient clinical notes, and prescription entry modals.

- **Figure 4.4: Interactive Patient Portal & Medical Profile** (`screenshots/07_patient_portal.png`)
  Patient command center presenting upcoming appointment countdown cards, booking history with status badges, and medical summary (blood group, allergies, emergency contacts).

- **Figure 4.5: Administrator Command Center & Recharts Analytics** (`screenshots/05_admin_dashboard.png`)
  Executive administrative interface displaying live hospital KPI counters (Total Patients, Doctors, Appointments, Completed, Pending) alongside Recharts visualizations (Weekly Appointment Trajectory and Status Mix donut charts).

#### Patient-Facing Screens
The patient interface comprises the landing page, specialist directory, 3-step booking wizard, consultation history, and medical profile. Real-time feedback, badge indicators, and automated slot locking streamline the booking experience.

#### Doctor-Facing Screens
The physician interface includes today's patient queue, schedule management (weekday selectors and slot increments), clinical encounter documentation (clinical notes and electronic prescriptions), and the patient consult registry.

#### Administrative Governance
The administrator interface provides complete oversight of medical personnel, patient registries, department configurations, and hospital appointment queues, backed by visual statistical summaries and interactive charts.

---

<div style="page-break-after: always;"></div>

**CAREPOINT | PAGE 6**

### 5. TESTING, DEPLOYMENT AND CONCLUSION

#### 5.1 Testing Approach & Results
Testing was conducted using an automated integration test suite (`test-e2e.js`) validating authentication, authorization, slot scheduling, duplicate prevention, and clinical operations.

| Test Area | Expected Behaviour | Result |
| :--- | :--- | :--- |
| **Health Check** | `GET /api/health` returns `200 OK` with status `healthy`. | **PASSED** |
| **Authentication** | Valid credentials issue JWT; invalid credentials return `401 Unauthorized`. | **PASSED** |
| **Registration Guard** | Public registration forces role `patient`; rejects role escalation. | **PASSED** |
| **Department CRUD** | Retrieval of all 10 departments with aggregated doctor counts; Admin creation/deletion. | **PASSED** |
| **Doctor Slot Engine** | Evaluates active practice weekdays and returns availability status per slot. | **PASSED** |
| **Duplicate Prevention** | Attempting to book an already occupied doctor/date/time slot returns `400 Bad Request`. | **PASSED** |
| **Past Date Prevention** | Booking on a past date is rejected with `400 Bad Request`. | **PASSED** |
| **Cross-Doctor Security**| Doctors cannot alter appointments belonging to another physician (`403 Forbidden`). | **PASSED** |
| **Clinical Charting** | Assigned physician can record clinical notes and electronic prescriptions. | **PASSED** |
| **Analytics Generation**| Returns valid chart data structures for weekly trends, department volume, and status mix. | **PASSED** |

**Summary: 22 Integration Checks Executed — 22 PASSED, 0 FAILED.**

#### 5.2 Installation and Execution
1. **Repository**: Clone from `https://github.com/bannurpunith2004/Hospital-Appointment-Management-System`.
2. **Dependencies**: Execute `npm install` inside `server/` and `client/`.
3. **Environment**: Configure `server/.env` (`PORT=5000`, `MONGODB_URI`, `JWT_SECRET`) and `client/.env` (`VITE_API_URL`).
4. **Database Seeding**: Execute `node server/seed.js` to populate realistic hospital data.
5. **Start Application**: Run `npm run server` (port 5000) and `npm run client` (port 5173).

#### 5.3 Conclusion & Future Enhancements
CarePoint demonstrates an end-to-end hospital management solution combining modern SaaS user experience with healthcare workflows. Real-time duplicate booking prevention, clinical queue management, electronic prescriptions, and visual analytics solve core challenges faced by medical facilities. Future enhancements will explore SMS appointment reminders, automated tele-consultation video rooms, and integration with HL7/FHIR hospital standards.

---

### REFERENCES
- React Documentation: https://react.dev/
- Express.js Framework: https://expressjs.com/
- MongoDB & Mongoose: https://www.mongodb.com/docs/ & https://mongoosejs.com/
- Tailwind CSS: https://tailwindcss.com/
- Recharts Library: https://recharts.org/

---

### GITHUB REPOSITORY
**[https://github.com/bannurpunith2004/Hospital-Appointment-Management-System](https://github.com/bannurpunith2004/Hospital-Appointment-Management-System)**
