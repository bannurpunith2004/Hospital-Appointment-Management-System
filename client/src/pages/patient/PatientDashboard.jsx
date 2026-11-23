import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Heart,
  ArrowRight,
  UserCheck,
  Building2,
  CalendarPlus,
  ShieldAlert,
  Star,
  MapPin,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { StatsSkeleton } from '../../components/LoadingSkeleton';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const patient = user?.patient;

  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [sRes, aRes, dRes, deptRes] = await Promise.all([
          analyticsService.getStats(),
          appointmentService.getAll({ limit: 5 }),
          doctorService.getAll({ limit: 3, sortBy: 'rating' }),
          departmentService.getAll({ limit: 4, activeOnly: 'true' }),
        ]);

        if (sRes.success) setStats(sRes.data);
        if (aRes.success) setAppointments(aRes.data);
        if (dRes.success) setRecommendedDoctors(dRes.data);
        if (deptRes.success) setDepartments(deptRes.data);
      } catch (err) {
        console.error('Failed to load patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Find next upcoming appointment
  const upcomingApp = appointments.find(
    (a) => ['pending', 'approved'].includes(a.status)
  );

  if (loading) {
    return <StatsSkeleton count={4} />;
  }

  return (
    <div className="space-y-8">
      {/* 1. WELCOME HERO SECTION */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold backdrop-blur-md">
            <span>Patient Health Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.name?.split(' ')[0] || 'Patient'}!
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-normal leading-relaxed">
            Manage your hospital appointments, book consultations with certified specialists, and
            access your prescriptions all in one secure portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/patient/book"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-md transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
          <Link
            to="/patient/appointments"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600/70 hover:bg-blue-600 text-white text-xs font-bold border border-white/20 transition-all"
          >
            <span>My Bookings</span>
          </Link>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Consultations"
          value={stats?.totalAppointments || 0}
          icon={Calendar}
          color="blue"
          subtitle="All scheduled visits"
        />
        <StatCard
          title="Upcoming Visits"
          value={stats?.upcomingAppointments || 0}
          icon={Clock}
          color="teal"
          subtitle="Pending or Approved"
        />
        <StatCard
          title="Completed Treatments"
          value={stats?.completedAppointments || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Past consultations"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingAppointments || 0}
          icon={AlertCircle}
          color="amber"
          subtitle="Awaiting clinic"
        />
      </div>

      {/* 3. UPCOMING APPOINTMENT & PATIENT PROFILE CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upcoming Appointment Highlight */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Next Upcoming Consultation</h3>
            {upcomingApp && <StatusBadge status={upcomingApp.status} />}
          </div>

          {upcomingApp ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      upcomingApp.doctor?.user?.avatar ||
                      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'
                    }
                    alt="Doctor"
                    className="w-14 h-14 rounded-2xl object-cover border border-blue-200"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                      {upcomingApp.department?.name || 'Department'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {upcomingApp.doctor?.user?.name}
                    </h4>
                    <p className="text-xs text-slate-500">{upcomingApp.doctor?.specialization}</p>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-blue-100">
                  <span className="text-xs font-black text-blue-700 bg-white px-3 py-1 rounded-xl shadow-sm inline-block">
                    {upcomingApp.appointmentDate}
                  </span>
                  <span className="block text-xs font-bold text-slate-600 mt-1">
                    {upcomingApp.appointmentTime}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-slate-400 font-bold uppercase">Reason for Visit:</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  "{upcomingApp.reason}"
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Room: {upcomingApp.doctor?.roomNumber || 'CarePoint Clinic Suite'}
                </span>
                <Link
                  to="/patient/appointments"
                  className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <span>Manage Appointment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">You currently have no upcoming visits scheduled.</p>
              <Link
                to="/patient/book"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Schedule a Doctor</span>
              </Link>
            </div>
          )}
        </div>

        {/* Patient Profile Snapshot */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Health Profile</h3>
            <Link to="/patient/profile" className="text-xs font-bold text-blue-600 hover:underline">
              Edit
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-500 font-medium">Blood Group:</span>
              <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {patient?.bloodGroup || 'Unknown'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 space-y-1">
              <span className="text-slate-500 font-medium block">Known Allergies:</span>
              <p className="font-semibold text-slate-700">
                {patient?.allergies?.length ? patient.allergies.join(', ') : 'No recorded allergies'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 space-y-1">
              <span className="text-slate-500 font-medium block">Emergency Contact:</span>
              <p className="font-semibold text-slate-700">
                {patient?.emergencyContact?.name
                  ? `${patient.emergencyContact.name} (${patient.emergencyContact.relationship}) - ${patient.emergencyContact.phone}`
                  : 'None listed'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 space-y-1">
              <span className="text-slate-500 font-medium block">Insurance Coverage:</span>
              <p className="font-semibold text-slate-700">
                {patient?.insuranceProvider || 'Direct Clinic Billing'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECOMMENDED SPECIALISTS FOR YOU */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recommended Medical Specialists</h3>
            <p className="text-xs text-slate-500">Board-certified doctors with top patient reviews</p>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={
                    doc.user?.avatar ||
                    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={doc.user?.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {doc.department?.name}
                    </span>
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{doc.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
                    {doc.user?.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">{doc.specialization}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Fee</span>
                  <span className="text-sm font-black text-slate-900">${doc.consultationFee}</span>
                </div>
                <Link
                  to={`/patient/book?doctorId=${doc._id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Book Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
