import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Building2,
  FileText,
  Ban,
  CalendarCheck,
  Eye,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import toast from 'react-hot-toast';

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  // Reschedule state
  const todayStr = new Date().toISOString().split('T')[0];
  const [newDate, setNewDate] = useState(todayStr);
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAll({
        status: filterTab !== 'all' ? filterTab : undefined,
      });
      if (res.success) setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to load your appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [filterTab]);

  // When opening reschedule modal, fetch doctor slots for the date
  const handleOpenReschedule = async (app) => {
    setSelectedApp(app);
    setNewDate(app.appointmentDate >= todayStr ? app.appointmentDate : todayStr);
    setNewTime('');
    setIsRescheduleOpen(true);
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!isRescheduleOpen || !selectedApp?.doctor?._id || !newDate) return;
      setLoadingSlots(true);
      try {
        const res = await doctorService.getSlots(selectedApp.doctor._id, newDate);
        if (res.success) {
          setAvailableSlots(res.slots || []);
        }
      } catch (err) {
        console.error('Error fetching slots for reschedule:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [isRescheduleOpen, newDate, selectedApp]);

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!newTime) {
      toast.error('Please pick an available time slot');
      return;
    }
    setSubmitting(true);
    try {
      const res = await appointmentService.reschedule(selectedApp._id, {
        appointmentDate: newDate,
        appointmentTime: newTime,
      });
      if (res.success) {
        toast.success('Appointment rescheduled successfully!');
        setIsRescheduleOpen(false);
        loadAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async () => {
    setSubmitting(true);
    try {
      const res = await appointmentService.update(selectedApp._id, { status: 'cancelled' });
      if (res.success) {
        toast.success('Appointment cancelled');
        setIsCancelOpen(false);
        loadAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Medical Consultations</h2>
          <p className="text-xs text-slate-500">
            View scheduled visits, review doctor prescriptions, reschedule, or cancel bookings
          </p>
        </div>
        <Link
          to="/patient/book"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Book Another Visit</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'all', label: 'All Consultations' },
          { id: 'approved', label: 'Approved Visits' },
          { id: 'pending', label: 'Pending Confirmation' },
          { id: 'completed', label: 'Completed History' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              filterTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List / Grid */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No appointments in this category"
          description="Schedule a consultation with our verified doctors in just a few clicks."
          actionText="Book an Appointment"
          onAction={() => (window.location.href = '/patient/book')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        app.doctor?.user?.avatar ||
                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
                      }
                      alt="Doctor"
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {app.department?.name || 'Department'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {app.doctor?.user?.name || 'Dr. Specialist'}
                      </h4>
                      <p className="text-xs text-slate-500">{app.doctor?.specialization}</p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div className="pt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Scheduled Date:</span>
                    <span className="font-bold text-slate-800">{app.appointmentDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Time Slot:</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {app.appointmentTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Clinic Room:</span>
                    <span className="font-semibold text-slate-700">
                      {app.doctor?.roomNumber || 'Main Clinic Suite'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Chief Complaint / Reason:
                    </span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1 line-clamp-2">
                      {app.reason}
                    </p>
                  </div>
                </div>

                {/* Prescription preview badge if exists */}
                {app.prescription && (
                  <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Doctor Prescription Available</span>
                    </span>
                    <p className="text-emerald-900 text-[11px] line-clamp-1 italic">
                      "{app.prescription}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedApp(app);
                    setIsViewOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-2">
                  {['pending', 'approved'].includes(app.status) && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenReschedule(app)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          setIsCancelOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewOpen && selectedApp && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Appointment Summary"
          subtitle={`Reference ID: #${selectedApp._id}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Status:</span>
              <StatusBadge status={selectedApp.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-xs uppercase font-bold">Doctor:</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedApp.doctor?.user?.name}</p>
                <p className="text-xs text-teal-700">{selectedApp.department?.name}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase font-bold">Consultation Slot:</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedApp.appointmentDate}</p>
                <p className="text-xs text-blue-600 font-bold">{selectedApp.appointmentTime}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 text-xs uppercase font-bold">Reason for Visit:</span>
              <p className="text-slate-700 text-xs">{selectedApp.reason}</p>
            </div>

            {selectedApp.doctorNotes && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                <span className="text-blue-800 text-xs uppercase font-bold">Physician Notes / Advice:</span>
                <p className="text-blue-950 text-xs leading-relaxed">{selectedApp.doctorNotes}</p>
              </div>
            )}

            {selectedApp.prescription && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-800 text-xs uppercase font-bold">Prescribed Medication:</span>
                <p className="text-emerald-950 text-xs leading-relaxed font-mono">
                  {selectedApp.prescription}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* RESCHEDULE MODAL */}
      {isRescheduleOpen && selectedApp && (
        <Modal
          isOpen={isRescheduleOpen}
          onClose={() => setIsRescheduleOpen(false)}
          title="Reschedule Appointment"
          subtitle={`With ${selectedApp.doctor?.user?.name}`}
        >
          <form onSubmit={handleConfirmReschedule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select New Date *
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Pick an Open Time Slot *
              </label>

              {loadingSlots ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 animate-pulse">
                  Checking doctor's open slots...
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={s.isBooked || !s.isAvailable}
                      onClick={() => setNewTime(s.time)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                        s.isBooked
                          ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                          : newTime === s.time
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{s.time}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting || !newTime}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {submitting ? 'Rescheduling...' : 'Confirm New Slot'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CANCEL CONFIRMATION */}
      {isCancelOpen && selectedApp && (
        <ConfirmDialog
          isOpen={isCancelOpen}
          onClose={() => setIsCancelOpen(false)}
          onConfirm={handleCancelAppointment}
          title="Cancel This Consultation?"
          message={`Are you sure you want to cancel your appointment with ${selectedApp.doctor?.user?.name} on ${selectedApp.appointmentDate} at ${selectedApp.appointmentTime}?`}
          confirmText="Yes, Cancel Booking"
          isDanger={true}
          isLoading={submitting}
        />
      )}
    </div>
  );
};
