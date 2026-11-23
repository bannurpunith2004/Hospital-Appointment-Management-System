import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import {
  Search,
  Filter,
  Star,
  Calendar,
  Clock,
  ArrowUpDown,
  Building2,
  CheckCircle,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

export const DoctorDirectoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDept = searchParams.get('department') || '';

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [order, setOrder] = useState('desc');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentService.getAll({ activeOnly: 'true' });
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepts();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        department: selectedDept || undefined,
        isAvailable: availableOnly ? 'true' : undefined,
        sortBy,
        order,
      };
      const res = await doctorService.getAll(params);
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedDept, availableOnly, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-teal-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-teal-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
            Specialist Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Find the Right Medical Specialist
          </h1>
          <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
            Search our directory of certified physicians, review clinical qualifications and consultation
            fees, and book your appointment directly online.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by physician name or specialization..."
              className="w-full pl-11 pr-24 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Department Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSearchParams(e.target.value ? { department: e.target.value } : {});
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="fee">Consultation Fee</option>
              <option value="name">Doctor Name</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <div className="md:col-span-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{order === 'asc' ? 'Ascending' : 'Descending'}</span>
            </button>
          </div>
        </div>

        {/* Available only toggle pill */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Show Only Actively Available Doctors</span>
          </label>
        </div>
      </div>

      {/* Doctors Grid Display */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors matched your criteria"
          description="Try clearing your search query or selecting a different department."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setSelectedDept('');
            setAvailableOnly(false);
            setSortBy('rating');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card hover:border-blue-200 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Doctor Card Top */}
              <div>
                <div className="p-6 pb-4 flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={
                        doc.user?.avatar ||
                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
                      }
                      alt={doc.user?.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                    />
                    {doc.isAvailable ? (
                      <span
                        title="Available for booking"
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                      />
                    ) : (
                      <span
                        title="Currently away"
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-400 border-2 border-white"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                        {doc.department?.name || 'Department'}
                      </span>
                      <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{doc.rating?.toFixed(1) || '4.9'}</span>
                        <span className="text-slate-400 font-normal">({doc.reviewCount || 24})</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1 truncate">
                      {doc.user?.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium line-clamp-1">
                      {doc.specialization}
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="px-6 py-2 space-y-2 text-xs text-slate-500 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <span>Clinical Experience:</span>
                    <span className="font-semibold text-slate-700">
                      {doc.experienceYears}+ Years
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Location / Room:</span>
                    <span className="font-semibold text-slate-700">
                      {doc.roomNumber || 'Main Clinic Tower'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span>Available Days:</span>
                    <span className="font-semibold text-slate-700 text-right max-w-[150px] truncate">
                      {doc.availableDays?.join(', ') || 'Mon-Fri'}
                    </span>
                  </div>
                  {doc.bio && (
                    <p className="pt-1 text-[11px] text-slate-400 line-clamp-2 italic leading-relaxed">
                      "{doc.bio}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Bottom */}
              <div className="p-6 pt-3 border-t border-slate-100 flex items-center justify-between mt-3 bg-slate-50/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Consultation Fee
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    ${doc.consultationFee}
                  </span>
                </div>

                <Link
                  to={`/patient/book?doctorId=${doc._id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
