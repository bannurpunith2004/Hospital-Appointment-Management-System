# CarePoint – Hospital Appointment Management System

[![CarePoint Health](https://img.shields.io/badge/CarePoint-Hospital%20Management%20SaaS-2563EB?style=for-the-badge&logo=hospital&logoColor=white)](https://carepoint.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Ready-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

**CarePoint** is an enterprise-grade, portfolio-ready Hospital Appointment Management System engineered with the MERN stack. Designed specifically to resemble high-end healthcare SaaS products, CarePoint delivers role-based access control (Admin, Doctor, Patient), automated duplicate booking prevention, live doctor slot availability synchronization, comprehensive electronic medical recordkeeping, interactive Recharts analytics, and responsive design.

---

## Quick Evaluation Demo Accounts

To test the multi-role experience immediately in development, you can use the built-in 1-click demo login buttons on the `/login` screen:

| Role | Email | Access & Responsibilities |
| :--- | :--- | :--- |
| **Administrator** | `admin@carepoint.com` | Executive overview, Doctor CRUD, Patient management, Department management, Analytics, All Appointments approval |
| **Doctor** | `dr.reynolds@carepoint.com` | Today's queue, Patient chart notes, Clinical prescriptions, Consultation status, Practice slots & availability |
| **Doctor (Alternative)**| `dr.chen@carepoint.com` | Chief of Neurology consultations and schedule |
| **Patient** | `patient@carepoint.com` | Slot booking wizard, Upcoming visits, Reschedule/Cancel, Prescription review, Medical profile & allergies |

*(Note: In local development, demo accounts are seeded via `node server/seed.js` with default passwords, or accessible via the 1-click autofill buttons on the login page).*

---

## Key Features & Architecture

### 1. Smart Appointment Booking Engine
- **Duplicate Booking Prevention**: Guarantees that no two patients can book the same doctor, date, and time slot simultaneously. Validated at both the Mongoose controller layer and database index layer.
- **Dynamic Slot Availability**: Calls `/api/doctors/:id/slots?date=YYYY-MM-DD` in real-time to inspect the doctor's weekly practice days and automatically disable occupied or past slots.
- **Date Validation**: Blocks past bookings and validates future clinical windows.
- **Rescheduling & Cancellation**: Patients can reschedule to open slots or cancel pending visits without hospital friction.

### 2. Multi-Role Portals
- **Administrator Dashboard**:
  - Real-time statistics: Total Patients, Total Doctors, Total Appointments, Today's Visits, Pending Queue, Completed Encounters.
  - Interactive Recharts: Weekly Appointment Trajectory (Area Chart), Status Mix (Donut Chart), Department Caseload (Bar Chart), 6-Month Trend.
  - Doctor CRUD: Add new doctors with credentials, update fees/specialization, view full profiles, remove inactive staff.
  - Patient Directory: Inspect reported allergies, past medical conditions, emergency contacts, and consultation history.
  - Department Management: Create and maintain medical departments, specialties, and department chiefs.
- **Doctor Portal**:
  - Daily appointment queue with instant 1-click status updates (Accept, Decline, Mark Completed).
  - Clinical encounter modal: Add diagnostic observations and electronic prescriptions directly to patient charts.
  - Schedule & Availability Manager: Toggle active practice weekdays (Mon-Sat), add custom appointment slot times, and toggle active/away status.
  - Consulted patient registry with emergency contacts and allergy alerts.
- **Patient Portal**:
  - Interactive 3-step booking wizard (Department -> Doctor -> Date & Time Slot -> Reason).
  - Next upcoming appointment highlight card with clinic room number and countdown.
  - Doctor recommendations with fees, ratings, and experience.
  - Personal health profile: blood group, emergency contacts, medical history, and health insurance information.
- **Public Hospital Website**:
  - Modern hero section with "Your Health, Our Priority."
  - Trust statistics strip (25k+ patients, 99.4% satisfaction, 24/7 emergency care).
  - Department cards with doctor counts and specializations.
  - Featured doctor directory with ratings, consultation fees, and booking CTAs.
  - How it Works (3-step illustrated walkthrough), Benefits, Patient Testimonials, FAQ accordion, Emergency contacts, and Footer.

---

## Technology Stack

- **Frontend**: React 19 (Vite), React Router v7, Tailwind CSS, Lucide React, Recharts, React Hook Form, React Hot Toast, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT), bcryptjs, Morgan, CORS, Dotenv
- **Database**: MongoDB (Local or MongoDB Atlas)
- **Deployment**: Vercel (Frontend), Render (Backend), MongoDB Atlas (Cloud Database)

---

## Project Structure

```text
hospital-appointment-system/
├── client/                      # Frontend React SPA
│   ├── public/                  # Public assets & favicon
│   ├── src/
│   │   ├── components/          # Reusable UI (StatCard, StatusBadge, Modal, Skeletons, Navbar, Sidebar)
│   │   ├── context/             # AuthContext (JWT management, user state, login, register, logout)
│   │   ├── layouts/             # PublicLayout, DashboardLayout
│   │   ├── pages/
│   │   │   ├── admin/           # AdminDashboard, DoctorManagement, PatientManagement, Appointments, etc.
│   │   │   ├── doctor/          # DoctorDashboard, DoctorAppointments, DoctorSchedule, DoctorPatients, etc.
│   │   │   ├── patient/         # PatientDashboard, BookAppointment, MyAppointments, PatientProfile
│   │   │   └── public/          # LandingPage, LoginPage, RegisterPage, DoctorDirectory, Departments, etc.
│   │   ├── routes/              # ProtectedRoute with role authorization guards
│   │   ├── services/            # Axios API services (auth, doctor, patient, appointment, department, analytics)
│   │   ├── App.jsx              # Main React route tree & Toaster configuration
│   │   ├── index.css            # Tailwind directives & healthcare color palette
│   │   └── main.jsx             # React DOM entry point
│   ├── index.html               # Main HTML entry with Inter typography
│   ├── tailwind.config.js       # Healthcare palette (#2563EB, #0F766E, #0F172A, #F8FAFC)
│   ├── vite.config.js           # Vite build & local proxy settings
│   ├── vercel.json              # Vercel SPA routing rewrites
│   └── package.json
├── server/                      # Backend Express REST API
│   ├── config/                  # MongoDB Mongoose connection
│   ├── controllers/             # authController, doctorController, patientController, appointmentController, etc.
│   ├── middleware/              # JWT auth protect, role authorization, errorHandler
│   ├── models/                  # User, Doctor, Patient, Department, Appointment Mongoose models
│   ├── routes/                  # Express REST routes
│   ├── seed.js                  # Comprehensive database seeding script
│   ├── server.js                # Express app configuration & middleware
│   ├── .env.example             # Example environment variables
│   └── package.json
├── render.yaml                  # Render cloud backend blueprint
├── test-e2e.js                  # Automated 22-step End-to-End test suite
├── package.json                 # Root script runner
├── .gitignore                   # Multi-tier Git exclusion rules
└── README.md
```

---

## Local Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher; v24 tested)
- [MongoDB](https://www.mongodb.com/) (Local Community Server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/carepoint-hospital-system.git
cd carepoint-hospital-system

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

**Server Environment (`server/.env`)**:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/carepoint
JWT_SECRET=carepoint_jwt_super_secret_production_key_987654321
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Client Environment (`client/.env`)**:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database with Realistic Clinical Data

Run the seed script to instantly populate 10 departments, 6 board-certified doctors, 6 patients with medical histories, and active appointments:

```bash
cd server
node seed.js
```

### 4. Run the Application

In two separate terminals:

**Terminal 1 (Backend Server)**:
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend Client)**:
```bash
cd client
npm run dev
# Client starts on http://localhost:5173
```

Open your browser to `http://localhost:5173` to explore CarePoint!

---

## Automated Test Suite

CarePoint includes an automated end-to-end integration test suite (`test-e2e.js`) covering:
- Authentication & JWT token issuance
- Enforcing public registration role restrictions (patients only)
- Department CRUD and doctor count aggregation
- Doctor schedule slots engine
- Appointment booking
- **Duplicate booking rejection (400 Bad Request)**
- **Past-date booking rejection (400 Bad Request)**
- Role ownership authorization (cross-doctor update rejection)
- Clinical notes & prescription issuance
- Appointment completion and treatment
- Admin dashboard analytics & KPI retrieval

Run tests using:
```bash
node test-e2e.js
```

Result: `Test Execution Summary: 22 PASSED, 0 FAILED`

---

## REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Register new patient account |
| **POST** | `/api/auth/login` | Public | Login with email & password |
| **GET** | `/api/auth/me` | Private | Retrieve authenticated user profile |
| **PUT** | `/api/auth/profile` | Private | Update profile & medical details |
| **PUT** | `/api/auth/change-password` | Private | Change password |
| **GET** | `/api/departments` | Public | List all departments with doctor counts |
| **POST** | `/api/departments` | Admin | Create new clinical department |
| **PUT** | `/api/departments/:id` | Admin | Update clinical department |
| **DELETE**| `/api/departments/:id` | Admin | Remove department (only if 0 doctors assigned) |
| **GET** | `/api/doctors` | Public | List doctors with filtering, search, and sorting |
| **GET** | `/api/doctors/:id` | Public | Single doctor credentials & biography |
| **GET** | `/api/doctors/:id/slots` | Public | Get open vs booked slots for a specific date |
| **POST** | `/api/doctors` | Admin | Add new physician with credentials |
| **PUT** | `/api/doctors/:id` | Admin/Doctor | Update physician details & availability |
| **DELETE**| `/api/doctors/:id` | Admin | Remove doctor profile |
| **GET** | `/api/patients` | Admin/Doctor | List all registered patients |
| **GET** | `/api/patients/:id` | Private | Get patient chart & consultation history |
| **PUT** | `/api/patients/:id` | Private | Update patient medical record |
| **GET** | `/api/appointments` | Private | Role-filtered appointment registry |
| **POST** | `/api/appointments` | Private | Reserve new appointment slot with duplicate check |
| **PUT** | `/api/appointments/:id` | Private | Update appointment status, clinical notes, Rx |
| **PUT** | `/api/appointments/:id/reschedule`| Private | Reschedule date/time to a free slot |
| **DELETE**| `/api/appointments/:id` | Admin/Patient | Delete or cancel appointment |
| **GET** | `/api/dashboard/stats` | Private | Summary KPI statistics |
| **GET** | `/api/dashboard/analytics` | Admin/Doctor | Weekly trends, status charts, department metrics |

---

## GitHub Repository Preparation

Follow these steps to upload CarePoint to your GitHub account:

```bash
# 1. Initialize git repository (if not already done)
git init

# 2. Add all project files
git add .

# 3. Check status to ensure .env and node_modules are excluded
git status

# 4. Commit changes
git commit -m "feat: complete CarePoint Hospital Appointment Management System"

# 5. Link your GitHub remote repository
git remote add origin https://github.com/<your-username>/carepoint-hospital-system.git

# 6. Push to main branch
git branch -M main
git push -u origin main
```

---

## Cloud Deployment Guide

### 1. Database: MongoDB Atlas
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a user (e.g. `carepoint_admin`) with a secure password.
4. Under **Network Access**, add IP Address `0.0.0.0/0` (allow access from anywhere) so Render can connect.
5. In your cluster view, click **Connect** -> **Connect your application** -> Copy the connection string:
   ```text
   mongodb+srv://carepoint_admin:<password>@cluster0.mongodb.net/carepoint?retryWrites=true&w=majority
   ```

### 2. Backend Deployment: Render
1. Sign in to [Render](https://render.com).
2. Click **New +** -> **Web Service** -> Connect your GitHub repository.
3. Configure settings:
   - **Name**: `carepoint-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Under **Environment Variables**, configure:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<A strong random secret string>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `https://your-carepoint-app.vercel.app`
5. Click **Create Web Service**. Once deployed, copy your Render API URL (e.g., `https://carepoint-api.onrender.com`).
6. Optionally, run the database seed on Render via SSH console or local connection: `node server/seed.js` with your Atlas URI.

### 3. Frontend Deployment: Vercel
1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project** -> Import your GitHub repository.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, configure:
   - `VITE_API_URL`: `https://carepoint-api.onrender.com/api`
5. Click **Deploy**. Vercel will build the frontend and serve it globally with instant CDN distribution and full SPA URL rewrites via `vercel.json`.

---

## Quality & Security Standards
- **OWASP Compliance**: Passwords hashed with salted bcrypt rounds.
- **JWT Protection**: Secured bearer tokens verified in Express middleware with role guards.
- **Data Protection**: Strict sanitization preventing users from escalating roles or accessing other doctors' appointments.
- **No Console Warnings**: Clean production builds with zero unhandled errors.

---

## License
MIT License. Built by CarePoint Engineering.
