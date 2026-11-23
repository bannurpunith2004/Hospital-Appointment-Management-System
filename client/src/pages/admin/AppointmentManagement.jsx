import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  Ban,
  Trash2,
  ArrowUpDown,
  Building2,
  UserCheck,
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { departmentService } from '../../services/departmentService';
import { doctorService } from '../../services/doctorService';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import toast from 'react-hot-toast';

export const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Status notes modal for doctor notes / prescription
  const [isEditNotesOpen, setIsEditNotesOpen] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescription, setPrescription] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, deptRes, docRes] = await Promise.all([
        appointmentService.getAll({
          search,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          date: dateFilter || undefined,
          departmentId: deptFilter || undefined,
          page,
          limit: 15,
        }),
        departmentService.getAll({ activeOnly: 'true' }),
        doctorService.getAll({ limit: 50 }),
      ]);

      if (appRes.success) {
        setAppointments(appRes.data);
        setTotalPages(appRes.totalPages || 1);
      }
      if (deptRes.success) setDepartments(deptRes.data);
      if (docRes.success) setDoctors(docRes.data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, dateFilter, deptFilter, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const res = await appointmentService.update(appointmentId, { status: newStatus });
      if (res.success) {
        toast.success(`Appointment status updated to ${newStatus}`);
        loadData();
        if (selectedApp) setSelectedApp(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await appointmentService.update(selectedApp._id, {
        doctorNotes,
        prescription,
      });
      if (res.success) {
        toast.success('Clinical notes & prescription updated');
        setIsEditNotesOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to update notes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await appointmentService.delete(selectedApp._id);
      if (res.success) {
        toast.success('Appointment cancelled/deleted');
        setIsCancelConfirmOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hospital Appointment Registry</h2>
          <p className="text-xs text-slate-500">
            Real-time management of patient bookings, clinical approvals, and visit statuses
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient, physician, or reason..."
              className="w-full pl-10 pr-16 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
            >
              Filter
            </button>
          </form>

          {/* Status Filter */}
          <div className="sm:col-span-3">
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

          {/* Department Filter */}
          <div className="sm:col-span-3">
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="sm:col-span-2">
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

        {/* Clear Filters reset if active */}
        {(statusFilter !== 'all' || dateFilter || deptFilter || search) && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Filters applied</span>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setDateFilter('');
                setDeptFilter('');
                setSearch('');
                setPage(1);
              }}
              className="font-bold text-blue-600 hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Appointments Data Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments match current filters"
          description="Adjust your search criteria or date filter to inspect more records."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor & Department</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Patient */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{app.patient?.name || 'Walk-in'}</p>
                      <p className="text-[11px] text-slate-400">{app.patient?.phone || app.patient?.email}</p>
                    </td>

                    {/* Doctor & Dept */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">
                        {app.doctor?.user?.name || 'Dr. Specialist'}
                      </p>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {app.department?.name || 'Clinical Dept'}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{app.appointmentDate}</p>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {app.appointmentTime}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <p className="text-slate-600 truncate" title={app.reason}>
                        {app.reason}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApp(app);
                            setIsViewOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve Button */}
                        {app.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'approved')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Approve Appointment"
                          >
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </button>
                        )}

                        {/* Complete Button */}
                        {app.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'completed')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark as Completed"
                          >
                            <Check className="w-4 h-4 text-emerald-600" />
                          </button>
                        )}

                        {/* Reject / Cancel */}
                        {['pending', 'approved'].includes(app.status) && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, 'cancelled')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Cancel Appointment"
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

          {/* Pagination Bar */}
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

      {/* VIEW APPOINTMENT MODAL */}
      {isViewOpen && selectedApp && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Hospital Appointment Record"
          subtitle={`Confirmation ID: #${selectedApp._id}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Current Status:</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold uppercase">Consultation Fee:</span>
                <p className="text-base font-extrabold text-slate-900">${selectedApp.fee || 50}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Patient</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedApp.patient?.name}</p>
                <p className="text-xs text-slate-500">{selectedApp.patient?.email}</p>
                <p className="text-xs text-slate-500">{selectedApp.patient?.phone}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Physician</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedApp.doctor?.user?.name}</p>
                <p className="text-xs text-teal-700 font-semibold">{selectedApp.department?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Appointment Date:</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedApp.appointmentDate}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Reserved Slot:</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedApp.appointmentTime}</p>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase font-bold">Reason for Visit:</span>
              <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedApp.reason}
              </p>
            </div>

            {selectedApp.notes && (
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Patient Notes:</span>
                <p className="text-xs text-slate-600 mt-1 italic">{selectedApp.notes}</p>
              </div>
            )}

            {/* Status Change Action Strip */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Update Status:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp._id, 'approved')}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp._id, 'completed')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold"
                >
                  Complete
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp._id, 'cancelled')}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
