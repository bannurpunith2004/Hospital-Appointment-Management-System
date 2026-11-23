import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
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
import { TrendingUp, BarChart3, Users, DollarSign, CalendarCheck } from 'lucide-react';
import { StatsSkeleton } from '../../components/LoadingSkeleton';

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          analyticsService.getAnalytics(),
          analyticsService.getStats(),
        ]);
        if (aRes.success) setAnalytics(aRes.data);
        if (sRes.success) setStats(sRes.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <StatsSkeleton count={4} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Hospital Intelligence & Performance</h2>
        <p className="text-xs text-slate-500">
          Executive operational metrics, patient throughput, and department workload analytics
        </p>
      </div>

      {/* Top operational KPI badges */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase">Total Patient Encounters</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalAppointments || 0}</p>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +15% over last month
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase">Clinical Completion Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {stats?.totalAppointments
              ? Math.round(((stats?.completedAppointments || 0) / stats.totalAppointments) * 100)
              : 85}
            %
          </p>
          <span className="text-xs text-slate-500 font-medium block mt-2">Discharge & recovery</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase">Active Physician Roster</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats?.totalDoctors || 0}</p>
          <span className="text-xs text-slate-500 font-medium block mt-2">Across 10 departments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-slate-400 text-xs font-bold uppercase">Today's Active Queue</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats?.todayAppointments || 0}</p>
          <span className="text-xs text-slate-500 font-medium block mt-2">Scheduled consultations</span>
        </div>
      </div>

      {/* Monthly Growth Trend Area Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Multi-Month Appointment Growth</h3>
          <p className="text-xs text-slate-500">6-Month longitudinal patient visit history and completion</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.monthlyTrend || []}>
              <defs>
                <linearGradient id="areaApp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="appointments"
                stroke="#2563EB"
                strokeWidth={3}
                fill="url(#areaApp)"
                name="Total Bookings"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#0F766E"
                strokeWidth={2}
                fill="#0F766E"
                fillOpacity={0.15}
                name="Successfully Treated"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Breakdown Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Clinical Department Demand Analysis</h3>
          <p className="text-xs text-slate-500">
            Total appointments handled vs active physicians per department
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analytics?.departmentStats || []}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="appointments" fill="#2563EB" radius={[6, 6, 0, 0]} name="Appointments" />
              <Bar dataKey="doctors" fill="#14B8A6" radius={[6, 6, 0, 0]} name="Physicians" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
