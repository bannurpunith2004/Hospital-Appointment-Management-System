import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  ArrowRight,
  Eye,
  CalendarDays,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { appointmentService } from '../../services/appointmentService';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { StatsSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';
import { Modal } from '../../components/Modal';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, analyticsRes, appsRes] = await Promise.all([
        analyticsService.getStats(),
        analyticsService.getAnalytics(),
        appointmentService.getAll({ limit: 6, sortBy: 'createdAt', order: 'desc' }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (appsRes.success) setRecentAppointments(appsRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <StatsSkeleton count={6} />
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          icon={Users}
          color="blue"
          trend="+12% this month"
          trendType="up"
        />
        <StatCard
          title="Medical Staff"
          value={stats?.totalDoctors || 0}
          icon={UserCheck}
          color="teal"
          subtitle="Board Certified"
        />
        <StatCard
          title="Appointments"
          value={stats?.totalAppointments || 0}
          icon={Calendar}
          color="indigo"
          trend="+18% overall"
          trendType="up"
        />
        <StatCard
          title="Today's Schedule"
          value={stats?.todayAppointments || 0}
          icon={Clock}
          color="amber"
          subtitle="Consults today"
        />
        <StatCard
          title="Pending Queue"
          value={stats?.pendingAppointments || 0}
          icon={AlertCircle}
          color="rose"
          subtitle="Needs review"
        />
        <StatCard
          title="Completed"
          value={stats?.completedAppointments || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Discharged / Treated"
        />
      </div>

      {/* 2. ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Appointment Volume Area Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Appointment Trajectory</h3>
              <p className="text-xs text-slate-500">Patient consultation volume across the last 7 days</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
              Daily Updates
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics?.weeklyTrend || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Appointments"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#16A34A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Appointment Status Mix</h3>
            <p className="text-xs text-slate-500">Distribution across active states</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.statusChart || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(analytics?.statusChart || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Status Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {(analytics?.statusChart || []).map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600 font-medium truncate">{s.name}:</span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. DEPARTMENT STATISTICS & RECENT BOOKINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Volume Bar Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Department Caseload</h3>
              <p className="text-xs text-slate-500">Patient visits grouped by clinical department</p>
            </div>
            <Link to="/admin/departments" className="text-xs font-bold text-blue-600 hover:underline">
              Manage
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(analytics?.departmentStats || []).slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="appointments" fill="#0F766E" radius={[0, 6, 6, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Appointments Registry Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Appointment Bookings</h3>
              <p className="text-xs text-slate-500">Latest scheduled patient visits across all clinics</p>
            </div>
            <Link
              to="/admin/appointments"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Physician</th>
                  <th className="pb-3">Date & Slot</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentAppointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-semibold text-slate-800">
                      {app.patient?.name || 'Walk-in Patient'}
                    </td>
                    <td className="py-3 text-slate-600">
                      {app.doctor?.user?.name || 'Dr. Specialist'}
                    </td>
                    <td className="py-3 text-slate-500">
                      <div>{app.appointmentDate}</div>
                      <span className="text-[10px] text-slate-400">{app.appointmentTime}</span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title="Appointment Record"
          subtitle={`ID: #${selectedApp._id}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Status:</span>
              <StatusBadge status={selectedApp.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Patient</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedApp.patient?.name}</p>
                <p className="text-xs text-slate-500">{selectedApp.patient?.email}</p>
                <p className="text-xs text-slate-500">{selectedApp.patient?.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Doctor / Department</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedApp.doctor?.user?.name}</p>
                <p className="text-xs text-teal-700 font-semibold">{selectedApp.department?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Scheduled Date</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedApp.appointmentDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Reserved Time Slot</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedApp.appointmentTime}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase">Reason for Visit</p>
              <p className="font-medium text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedApp.reason}
              </p>
            </div>
            {selectedApp.doctorNotes && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-semibold uppercase">Clinical Notes</p>
                <p className="text-xs text-slate-700 mt-1 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  {selectedApp.doctorNotes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
