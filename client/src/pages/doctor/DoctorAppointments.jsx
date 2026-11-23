import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Check,
  Ban,
  Clock,
  User,
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import toast from 'react-hot-toast';

export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAll({
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        date: dateFilter || undefined,
        page,
        limit: 15,
      });
      if (res.success) {
        setAppointments(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, dateFilter, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadAppointments();
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await appointmentService.update(appId, { status: newStatus });
      if (res.success) {
        toast.success(`Appointment marked as ${newStatus}`);
        loadAppointments();
      }
    } catch (err) {
      toast.error('Failed to update status');
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
        toast.success('Clinical chart updated');
        setIsNotesOpen(false);
        loadAppointments();
      }
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Assigned Consultations</h2>
        <p className="text-xs text-slate-500">
          Review, approve, and manage all your scheduled patient visits and prescriptions
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name, reason, or symptoms..."
            className="w-full pl-10 pr-16 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
          >
            Search
          </button>
        </form>

        <div className="w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="w-full sm:w-40">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="You currently have no consultations matching these filters."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Reason for Visit</th>
                  <th className="py-3 px-4">Prescription / Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{app.patient?.name}</p>
                      <p className="text-[11px] text-slate-400">{app.patient?.phone}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{app.appointmentDate}</span>
                      <span className="block text-[11px] font-bold text-blue-600">
                        {app.appointmentTime}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate" title={app.reason}>
                      {app.reason}
                    </td>

                    <td className="py-3 px-4">
                      {app.prescription ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Prescription Added
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">None logged</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenNotes(app)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Edit Clinical Notes / Rx"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {app.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'approved')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Accept"
                          >
                            <Check className="w-4 h-4 text-blue-600" />
                          </button>
                        )}

                        {app.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'completed')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Complete"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </button>
                        )}

                        {['pending', 'approved'].includes(app.status) && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'rejected')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Decline"
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

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NOTES MODAL */}
      {isNotesOpen && selectedApp && (
        <Modal
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          title={`Clinical Encounter: ${selectedApp.patient?.name}`}
          subtitle={`${selectedApp.appointmentDate} at ${selectedApp.appointmentTime}`}
        >
          <form onSubmit={handleSaveNotes} className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Patient Chief Complaint:</span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                {selectedApp.reason}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Physician Clinical Notes
              </label>
              <textarea
                rows={3}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Findings, blood pressure, diagnostic impression..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Prescription & Treatment Protocol
              </label>
              <textarea
                rows={3}
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Rx name, dosage, instructions, follow up..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNotesOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingNotes}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                {savingNotes ? 'Saving...' : 'Update Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
