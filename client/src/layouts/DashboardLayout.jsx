import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';

export const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Helper to determine title based on path
  const getHeaderMeta = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return { title: 'Hospital Executive Overview', subtitle: 'Real-time clinical throughput, analytics, and hospital metrics' };
    if (path.includes('/admin/appointments')) return { title: 'Hospital Appointment Registry', subtitle: 'Manage, confirm, reschedule, or cancel all patient consultations' };
    if (path.includes('/admin/doctors')) return { title: 'Medical Staff & Doctor Management', subtitle: 'Physician directories, profiles, clinical fees, and rosters' };
    if (path.includes('/admin/patients')) return { title: 'Registered Patient Directory', subtitle: 'Patient demographic records, allergies, and history' };
    if (path.includes('/admin/departments')) return { title: 'Clinical Department Directory', subtitle: 'Manage hospital specialties, departments, and leadership' };
    if (path.includes('/admin/analytics')) return { title: 'Hospital Intelligence & Analytics', subtitle: 'Appointment trends, department volume, and operational metrics' };
    if (path.includes('/admin/profile')) return { title: 'Administrative Settings', subtitle: 'Configure account credentials and hospital preferences' };

    if (path.includes('/doctor/dashboard')) return { title: 'Physician Clinical Dashboard', subtitle: 'Today’s appointment queue, patient schedule, and quick actions' };
    if (path.includes('/doctor/appointments')) return { title: 'Assigned Consultations', subtitle: 'Review appointment requests, provide clinical notes and prescriptions' };
    if (path.includes('/doctor/schedule')) return { title: 'Schedule & Availability Manager', subtitle: 'Set your active practice days and manage consultation time slots' };
    if (path.includes('/doctor/patients')) return { title: 'Patient Consult Registry', subtitle: 'Review medical records and history of your patients' };
    if (path.includes('/doctor/profile')) return { title: 'Physician Profile & Bio', subtitle: 'Update your clinical bio, qualifications, fee, and room assignment' };

    if (path.includes('/patient/dashboard')) return { title: 'Patient Care Portal', subtitle: 'Your personal health dashboard, appointments, and doctors' };
    if (path.includes('/patient/book')) return { title: 'Schedule Doctor Appointment', subtitle: 'Select specialist, department, date, and reserve your time slot' };
    if (path.includes('/patient/appointments')) return { title: 'My Appointments & History', subtitle: 'View scheduled consultations, reschedule, or review prescriptions' };
    if (path.includes('/patient/profile')) return { title: 'Personal Medical Profile', subtitle: 'Manage your blood group, emergency contacts, and medical history' };

    return { title: 'CarePoint Portal', subtitle: 'Healthcare Management' };
  };

  const { title, subtitle } = getHeaderMeta();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader
          onMenuClick={() => setIsMobileOpen(true)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
