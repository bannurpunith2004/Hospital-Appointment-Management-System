import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Heart,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Shield,
  Activity,
} from 'lucide-react';
import { patientService } from '../../services/patientService';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import toast from 'react-hot-toast';

export const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [fullPatientData, setFullPatientData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bloodGroup: '',
    medicalHistory: '',
    allergies: '',
  });

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await patientService.getAll({
        search,
        bloodGroup: bloodGroup || undefined,
        page,
        limit: 10,
      });
      if (res.success) {
        setPatients(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [bloodGroup, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadPatients();
  };

  const handleOpenView = async (patient) => {
    setSelectedPatient(patient);
    setIsViewOpen(true);
    try {
      const res = await patientService.getById(patient._id);
      if (res.success) {
        setFullPatientData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch patient full detail:', err);
    }
  };

  const handleOpenEdit = (patient) => {
    setSelectedPatient(patient);
    setEditFormData({
      name: patient.user?.name || '',
      phone: patient.user?.phone || '',
      address: patient.user?.address || '',
      bloodGroup: patient.bloodGroup || 'Unknown',
      medicalHistory: (patient.medicalHistory || []).join(', '),
      allergies: (patient.allergies || []).join(', '),
    });
    setIsEditOpen(true);
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: editFormData.name,
        phone: editFormData.phone,
        address: editFormData.address,
        bloodGroup: editFormData.bloodGroup,
        medicalHistory: editFormData.medicalHistory
          ? editFormData.medicalHistory.split(',').map((s) => s.trim())
          : [],
        allergies: editFormData.allergies
          ? editFormData.allergies.split(',').map((s) => s.trim())
          : [],
      };
      const res = await patientService.update(selectedPatient._id, payload);
      if (res.success) {
        toast.success('Patient details updated successfully!');
        setIsEditOpen(false);
        loadPatients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async () => {
    setSubmitting(true);
    try {
      const res = await patientService.delete(selectedPatient._id);
      if (res.success) {
        toast.success('Patient record removed successfully');
        setIsDeleteOpen(false);
        loadPatients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete patient with active appointments');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Hospital Patient Directory</h2>
        <p className="text-xs text-slate-500">
          Review patient medical histories, clinical records, and past consultations
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
            placeholder="Search by patient name, email, or telephone..."
            className="w-full pl-10 pr-20 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
          >
            Search
          </button>
        </form>

        <div className="w-full sm:w-48">
          <select
            value={bloodGroup}
            onChange={(e) => {
              setBloodGroup(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patient records found"
          description="Patients will appear here when registered through the patient portal."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient Profile</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Total Consultations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.user?.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.user?.name || 'Patient')}`
                          }
                          alt={p.user?.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{p.user?.name}</p>
                          <p className="text-[11px] text-slate-400">{p.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 text-[11px]">
                        <Heart className="w-3 h-3 fill-rose-500" />
                        <span>{p.bloodGroup || 'Unknown'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-600">
                      {p.user?.phone || 'Not recorded'}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      {p.totalAppointments || 0} Visits
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenView(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Chart"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Info"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPatient(p);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {/* VIEW PATIENT MODAL */}
      {isViewOpen && selectedPatient && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setFullPatientData(null);
          }}
          title="Patient Clinical Profile"
          subtitle={`Patient Record ID: ${selectedPatient._id}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <img
                src={
                  selectedPatient.user?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedPatient.user?.name || 'Patient')}`
                }
                alt={selectedPatient.user?.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedPatient.user?.name}</h4>
                <p className="text-xs text-slate-500">{selectedPatient.user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                    Blood Group: {selectedPatient.bloodGroup}
                  </span>
                  <span className="text-slate-500 text-xs">
                    Gender: {selectedPatient.user?.gender || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-xs uppercase font-bold">Contact Phone:</span>
                <p className="font-semibold text-slate-800">{selectedPatient.user?.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase font-bold">Address:</span>
                <p className="font-semibold text-slate-800">{selectedPatient.user?.address || 'N/A'}</p>
              </div>
            </div>

            {/* Allergies & Medical History */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1">
              <span className="text-amber-800 font-bold text-xs uppercase">Allergies:</span>
              <p className="text-amber-900 text-xs">
                {selectedPatient.allergies?.length
                  ? selectedPatient.allergies.join(', ')
                  : 'No known allergies reported'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-700 font-bold text-xs uppercase">Past Medical Conditions:</span>
              <p className="text-slate-600 text-xs">
                {selectedPatient.medicalHistory?.length
                  ? selectedPatient.medicalHistory.join(', ')
                  : 'None documented'}
              </p>
            </div>

            {/* Appointments History List */}
            {fullPatientData?.appointments && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-700 font-bold text-xs uppercase block mb-2">
                  Hospital Consultation History ({fullPatientData.appointments.length}):
                </span>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {fullPatientData.appointments.map((app) => (
                    <div
                      key={app._id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{app.doctor?.user?.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {app.appointmentDate} at {app.appointmentTime} • {app.department?.name}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* EDIT PATIENT MODAL */}
      {isEditOpen && selectedPatient && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit ${selectedPatient.user?.name}`}
        >
          <form onSubmit={handleUpdatePatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Blood Group
                </label>
                <select
                  value={editFormData.bloodGroup}
                  onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  City / Address
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Allergies (comma separated)
              </label>
              <input
                type="text"
                value={editFormData.allergies}
                onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
                placeholder="Penicillin, Sulfa, Peanuts"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Medical History (comma separated)
              </label>
              <input
                type="text"
                value={editFormData.medicalHistory}
                onChange={(e) => setEditFormData({ ...editFormData, medicalHistory: e.target.value })}
                placeholder="Asthma, Hypertension, Appendectomy"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                {submitting ? 'Saving...' : 'Update Details'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteOpen && selectedPatient && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeletePatient}
          title="Remove Patient Record?"
          message={`Are you sure you want to remove ${selectedPatient.user?.name}? All associated medical records will be deleted.`}
          confirmText="Yes, Delete Record"
          isLoading={submitting}
        />
      )}
    </div>
  );
};
