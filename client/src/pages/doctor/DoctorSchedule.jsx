import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import toast from 'react-hot-toast';

export const DoctorSchedule = () => {
  const { user, updateUser } = useAuth();
  const doctor = user?.doctor;

  const allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [availableDays, setAvailableDays] = useState(
    doctor?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  );
  const [timeSlots, setTimeSlots] = useState(
    doctor?.timeSlots || [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
    ]
  );
  const [isAvailable, setIsAvailable] = useState(doctor?.isAvailable ?? true);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [saving, setSaving] = useState(false);

  // Calendar day view of scheduled appointments
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayAppointments, setDayAppointments] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const fetchDayAppointments = async (date) => {
    setLoadingSchedule(true);
    try {
      const res = await appointmentService.getAll({ date });
      if (res.success) setDayAppointments(res.data);
    } catch (err) {
      console.error('Failed to load day schedule:', err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    fetchDayAppointments(calendarDate);
  }, [calendarDate]);

  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSlotTime) return;
    const formatted = newSlotTime.trim();
    if (timeSlots.includes(formatted)) {
      toast.error('This slot already exists in your schedule');
      return;
    }
    setTimeSlots([...timeSlots, formatted].sort());
    setNewSlotTime('');
  };

  const handleRemoveSlot = (slotToRemove) => {
    setTimeSlots(timeSlots.filter((slot) => slot !== slotToRemove));
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      const res = await authService.updateProfile({
        availableDays,
        timeSlots,
        isAvailable,
      });
      if (res.success) {
        updateUser(res.user);
        toast.success('Practice availability & time slots updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Clinical Schedule & Availability Settings</h2>
        <p className="text-xs text-slate-500">
          Configure working consultation days, time slot increments, and inspect your daily calendar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Availability Configuration */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Practice Availability Status</h3>
                <p className="text-xs text-slate-500">Allow patients to book new appointments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-xs text-slate-500">
              {isAvailable
                ? 'Your profile is currently accepting patient bookings during configured slots.'
                : 'You are currently marked Away. Patients cannot reserve new slots with you.'}
            </p>
          </div>

          {/* Days of week */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Practice Days</h3>
              <p className="text-xs text-slate-500">
                Select the weekdays when you conduct outpatient clinic hours
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allWeekdays.map((day) => {
                const isSelected = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{day}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Consultation Time Slots</h3>
                <p className="text-xs text-slate-500">Available intervals presented to patients</p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                {timeSlots.length} Slots Active
              </span>
            </div>

            {/* Add slot form */}
            <form onSubmit={handleAddSlot} className="flex gap-2">
              <input
                type="text"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                placeholder="e.g. 05:00 PM"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Slot
              </button>
            </form>

            {/* Slots list */}
            <div className="flex flex-wrap gap-2 pt-2">
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:border-slate-300"
                >
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span>{slot}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot)}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveAvailability}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Availability Changes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Appointment Schedule Calendar View */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Calendar Inspection</h3>
              <p className="text-xs text-slate-500">Pick any date to review scheduled consultations</p>
            </div>
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
            />
          </div>

          {loadingSchedule ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Loading appointments for {calendarDate}...
            </div>
          ) : dayAppointments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
              <p>No appointments booked on {calendarDate}.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {dayAppointments.map((app) => (
                <div
                  key={app._id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                        {app.appointmentTime}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{app.patient?.name}</p>
                    <p className="text-xs text-slate-500 italic">"{app.reason}"</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block">Contact</span>
                    <span className="font-semibold text-slate-700">{app.patient?.phone || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
