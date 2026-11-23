import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  Heart,
  Phone,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { patientService } from '../../services/patientService';
import { Modal } from '../../components/Modal';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import toast from 'react-hot-toast';

export const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await patientService.getAll({ search });
      if (res.success) setPatients(res.data);
    } catch (err) {
      toast.error('Failed to load patient roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPatients();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Patient Consultation Registry</h2>
        <p className="text-xs text-slate-500">
          Medical history records, reported allergies, and prior clinical visits of your patients
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearch} className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient by name or phone..."
            className="w-full pl-10 pr-20 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description="Patients will appear here after booking consultations with you."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Allergies</th>
                  <th className="py-3 px-4">Phone Contact</th>
                  <th className="py-3 px-4">Total Visits</th>
                  <th className="py-3 px-4 text-right">Medical Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            p.user?.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.user?.name || 'Patient')}`
                          }
                          alt={p.user?.name}
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.user?.name}</p>
                          <p className="text-[11px] text-slate-400">{p.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                        {p.bloodGroup || 'Unknown'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {p.allergies?.length ? (
                        <span className="text-amber-700 font-semibold">{p.allergies.join(', ')}</span>
                      ) : (
                        <span className="text-slate-400">None reported</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">{p.user?.phone || 'N/A'}</td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      {p.totalAppointments || 1} Visits
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(p);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Chart</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PATIENT CHART MODAL */}
      {isModalOpen && selectedPatient && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Clinical History: ${selectedPatient.user?.name}`}
          subtitle={`Patient Record #${selectedPatient._id}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Blood Group:</span>
                <p className="text-sm font-black text-rose-600 mt-0.5">{selectedPatient.bloodGroup}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Gender:</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">
                  {selectedPatient.user?.gender || 'Unspecified'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <span className="text-amber-800 font-bold text-xs uppercase block">
                Known Drug / Environmental Allergies:
              </span>
              <p className="text-amber-900 text-xs">
                {selectedPatient.allergies?.length
                  ? selectedPatient.allergies.join(', ')
                  : 'No allergies recorded'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-700 font-bold text-xs uppercase block">
                Chronic Conditions / Medical History:
              </span>
              <p className="text-slate-600 text-xs">
                {selectedPatient.medicalHistory?.length
                  ? selectedPatient.medicalHistory.join(', ')
                  : 'No prior conditions recorded'}
              </p>
            </div>

            {selectedPatient.emergencyContact?.name && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 uppercase font-bold block mb-1">
                  Emergency Contact:
                </span>
                <p className="text-xs text-slate-700">
                  <b>{selectedPatient.emergencyContact.name}</b> (
                  {selectedPatient.emergencyContact.relationship}) •{' '}
                  {selectedPatient.emergencyContact.phone}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
