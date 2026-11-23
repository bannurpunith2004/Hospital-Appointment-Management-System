import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Star,
  ArrowRight,
  ShieldCheck,
  Ban,
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { appointmentService } from '../../services/appointmentService';
import toast from 'react-hot-toast';

export const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctorId') || '';
  const preselectedDeptId = searchParams.get('department') || '';

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [selectedDept, setSelectedDept] = useState(preselectedDeptId);
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Default to tomorrow or today's date in 'YYYY-MM-DD'
  const todayStr = new Date().toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState(todayStr);

  // Available Slots state
  const [slotData, setSlotData] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Reason & Notes
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load departments and doctors
  useEffect(() => {
    const initData = async () => {
      try {
        const [deptRes, docRes] = await Promise.all([
          departmentService.getAll({ activeOnly: 'true' }),
          doctorService.getAll({ limit: 50, isAvailable: 'true' }),
        ]);

        if (deptRes.success) setDepartments(deptRes.data);
        if (docRes.success) {
          setDoctors(docRes.data);
          // If preselected doctor ID, find doctor object
          if (preselectedDoctorId) {
            const matched = docRes.data.find((d) => d._id === preselectedDoctorId);
            if (matched) {
              setSelectedDoctor(matched);
              setSelectedDept(matched.department?._id || '');
            }
          }
        }
      } catch (err) {
        toast.error('Failed to load clinic options');
      } finally {
        setLoadingInitial(false);
      }
    };
    initData();
  }, [preselectedDoctorId]);

  // When selected doctor changes, update selectedDoctor object and reset time slot
  const handleDoctorChange = (docId) => {
    setSelectedDoctorId(docId);
    setSelectedTimeSlot('');
    const docObj = doctors.find((d) => d._id === docId);
    setSelectedDoctor(docObj || null);
    if (docObj?.department?._id) {
      setSelectedDept(docObj.department._id);
    }
  };

  // When department changes, if current doctor does not belong, clear doctor
  const handleDeptChange = (deptId) => {
    setSelectedDept(deptId);
    if (selectedDoctor && selectedDoctor.department?._id !== deptId) {
      setSelectedDoctorId('');
      setSelectedDoctor(null);
      setSelectedTimeSlot('');
    }
  };

  // Filtered doctors list based on selected department
  const filteredDoctors = selectedDept
    ? doctors.filter((doc) => doc.department?._id === selectedDept)
    : doctors;

  // Fetch slot availability when selected doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctorId || !appointmentDate) {
        setSlotData(null);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await doctorService.getSlots(selectedDoctorId, appointmentDate);
        if (res.success) {
          setSlotData(res);
          setSelectedTimeSlot(''); // reset selected slot on date change
        }
      } catch (err) {
        console.warn('Could not fetch doctor slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDoctorId, appointmentDate]);

  // Form submission
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!selectedDoctorId) {
      toast.error('Please choose a physician');
      return;
    }
    if (!appointmentDate) {
      toast.error('Please select an appointment date');
      return;
    }
    if (appointmentDate < todayStr) {
      toast.error('Appointment date cannot be in the past');
      return;
    }
    if (!selectedTimeSlot) {
      toast.error('Please select an available consultation time slot');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide the reason for your visit');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doctorId: selectedDoctorId,
        departmentId: selectedDept || selectedDoctor?.department?._id,
        appointmentDate,
        appointmentTime: selectedTimeSlot,
        reason: reason.trim(),
        notes: notes.trim(),
      };

      const res = await appointmentService.book(payload);
      if (res.success) {
        toast.success(res.message || 'Appointment reserved successfully!');
        navigate('/patient/appointments');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Slot reservation failed. This time may have just been booked. Please choose another.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Book Doctor Appointment</h2>
        <p className="text-xs text-slate-500">
          Real-time slot reservation with automatic duplicate conflict prevention
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Booking Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <form onSubmit={handleSubmitBooking} className="space-y-6">
            {/* Step 1: Department & Doctor */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Select Department & Specialist</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Clinical Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => handleDeptChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Doctor Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Physician Specialist *
                  </label>
                  <select
                    required
                    value={selectedDoctorId}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">Choose a doctor...</option>
                    {filteredDoctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.user?.name} - {doc.specialization} (${doc.consultationFee})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Date & Available Slots */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Choose Consultation Date & Open Slot</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Appointments can only be booked for today or future dates.
                  </span>
                </div>

                {/* Working Day Warning */}
                {slotData && !slotData.isWorkingDay && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Not a scheduled clinic day</p>
                      <p className="text-[11px] mt-0.5">
                        This doctor does not typically practice on {slotData.dayOfWeek}s. Please pick
                        another day.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Slots Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Select Available Time Slot *
                </label>

                {!selectedDoctorId ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-400">
                    Select a physician above to inspect available consultation time slots.
                  </div>
                ) : loadingSlots ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-400 animate-pulse">
                    Synchronizing doctor's live calendar...
                  </div>
                ) : slotData?.slots?.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500">
                    No time slots configured for this physician.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slotData?.slots?.map((slotItem) => {
                      const isSelected = selectedTimeSlot === slotItem.time;
                      const isBooked = slotItem.isBooked;

                      return (
                        <button
                          key={slotItem.time}
                          type="button"
                          disabled={isBooked || !slotItem.isAvailable}
                          onClick={() => setSelectedTimeSlot(slotItem.time)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                            isBooked
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70'
                              : isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25 ring-2 ring-blue-600/30'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{slotItem.time}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" /> Open Slot
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300" /> Booked / Unavailable
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Reason & Notes */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Visit Details & Symptoms</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason for Consultation / Symptoms *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Persistent tension headache, need prescription review, seasonal allergy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Additional Notes for Doctor (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any prior tests taken, ongoing medications, specific questions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting || !selectedTimeSlot}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-700 hover:from-blue-700 hover:to-teal-800 text-white font-bold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Reserve Consultation Slot</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Selected Doctor & Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Reservation Summary
            </h3>

            {selectedDoctor ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedDoctor.user?.avatar ||
                      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={selectedDoctor.user?.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{selectedDoctor.user?.name}</h4>
                    <p className="text-teal-700 font-semibold">{selectedDoctor.specialization}</p>
                    <p className="text-slate-400">{selectedDoctor.department?.name}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="font-bold text-slate-800">{appointmentDate || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time Slot:</span>
                    <span className="font-bold text-blue-600">{selectedTimeSlot || 'Not chosen'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clinic Room:</span>
                    <span className="font-semibold text-slate-700">
                      {selectedDoctor.roomNumber || 'Main Clinic'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-600 font-bold uppercase">Consultation Fee:</span>
                    <span className="text-base font-black text-slate-900">
                      ${selectedDoctor.consultationFee}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Select a doctor to view their credentials, clinic room, and fee.
              </p>
            )}

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2 text-[11px] text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Instant slot reservation. You can reschedule or cancel at any time from your patient
                dashboard.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
