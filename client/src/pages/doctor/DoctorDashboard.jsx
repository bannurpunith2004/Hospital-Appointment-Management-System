import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
  Eye,
  Check,
  Ban,
  ArrowRight,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { appointmentService } from '../../services/appointmentService';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { StatsSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notes Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const loadData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [sRes, aRes] = await Promise.all([
        analyticsService.getStats(),
        appointmentService.getAll({ date: todayStr }),
      ]);
      if (sRes.success) setStats(sRes.data);
      if (aRes.success) setTodayAppointments(aRes.data);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await appointmentService.update(appId, { status: newStatus });
      if (res.success) {
        toast.success(`Appointment marked as ${newStatus}`);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to update appointment');
    }
  };

  const handleOpenNotes = (app) => {
    setSelectedApp(app);
    setDoctorNotes(app.doctorNotes || '');
    setPrescription(app.prescription || '');
    setIsNotesOpen(true);
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    setSavingNotes(true);
    try {
      const res = await appointmentService.update(selectedApp._id, {
        doctorNotes,
        prescription,
      });
      if (res.success) {
        toast.success('Clinical notes & prescription updated');
        setIsNotesOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to save clinical notes');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton count={4} />
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-white/10 px-3 py-1 rounded-full">
            Physician Clinical Suite
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">Welcome, {user?.name}</h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            {user?.doctor?.specialization || 'Clinical Specialist'} • Room:{' '}
            {user?.doctor?.roomNumber || 'Main Clinic Suite'}
          </p>
        </div>
        <Link
          to="/doctor/schedule"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white text-blue-800 hover:bg-blue-50 text-xs font-bold shadow-md transition-all"
        >
          Manage Availability Slots
        </Link>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Consultations"
          value={stats?.todayAppointments || 0}
          icon={Clock}
          color="amber"
          subtitle="Scheduled for today"
        />
        <StatCard
          title="Upcoming Queue"
          value={stats?.upcomingAppointments || 0}
          icon={Calendar}
          color="blue"
          subtitle="This week & ahead"
        />
        <StatCard
          title="Total Patients Seen"
          value={stats?.totalPatients || 0}
          icon={Users}
          color="teal"
          subtitle="Unique individuals"
        />
        <StatCard
          title="Completed Discharges"
          value={stats?.completedAppointments || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="All-time treatments"
        />
      </div>

      {/* Today's Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Appointment Queue</h3>
            <p className="text-xs text-slate-500">
              Patients scheduled for consultation today ({new Date().toLocaleDateString()})
            </p>
          </div>
          <Link
            to="/doctor/appointments"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>All Appointments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No consultations booked for today. Enjoy your day or check upcoming slots!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Slot Time</th>
                  <th className="pb-3">Patient Name</th>
                  <th className="pb-3">Reason for Visit</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {todayAppointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-bold text-blue-700 bg-blue-50/50 px-2 rounded-lg inline-block my-2">
                      {app.appointmentTime}
                    </td>

                    <td className="py-3 font-semibold text-slate-800">
                      <div>{app.patient?.name}</div>
                      <span className="text-[11px] text-slate-400">{app.patient?.phone}</span>
                    </td>

                    <td className="py-3 text-slate-600 max-w-xs truncate" title={app.reason}>
                      {app.reason}
                    </td>

                    <td className="py-3">
                      <StatusBadge status={app.status} />
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Clinical notes button */}
                        <button
                          type="button"
                          onClick={() => handleOpenNotes(app)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Add Prescription / Notes"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Approve */}
                        {app.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'approved')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Accept Appointment"
                          >
                            <Check className="w-4 h-4 text-blue-600" />
                          </button>
                        )}

                        {/* Complete */}
                        {app.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'completed')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark as Completed"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </button>
                        )}

                        {/* Reject */}
                        {['pending', 'approved'].includes(app.status) && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'rejected')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Decline / Reject"
                          >
                            <Ban className="w-4 h-4 text-rose-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clinical Notes & Prescription Modal */}
      {isNotesOpen && selectedApp && (
        <Modal
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          title={`Clinical Consultation: ${selectedApp.patient?.name}`}
          subtitle={`Slot: ${selectedApp.appointmentDate} at ${selectedApp.appointmentTime}`}
        >
          <form onSubmit={handleSaveNotes} className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Patient Reported Reason:</span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                {selectedApp.reason}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Physician Clinical Notes / Diagnosis
              </label>
              <textarea
                rows={3}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Diagnostic assessment, vitals, exam observations, recommendations..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Prescription & Medication Directions
              </label>
              <textarea
                rows={3}
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Prescribed drugs, dosage (e.g. 500mg BID), duration, lifestyle guidance..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={savingNotes}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                {savingNotes ? 'Saving...' : 'Save Prescription & Notes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
