import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Users,
  Building2,
  BarChart3,
  Clock,
  CalendarPlus,
  User,
  Settings,
  LogOut,
  Hospital,
  ChevronRight,
  Shield,
  Stethoscope,
  HeartHandshake,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
          { name: 'Doctors', path: '/admin/doctors', icon: UserCheck },
          { name: 'Patients', path: '/admin/patients', icon: Users },
          { name: 'Departments', path: '/admin/departments', icon: Building2 },
          { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
          { name: 'Settings', path: '/admin/profile', icon: Settings },
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
          { name: 'Schedule & Slots', path: '/doctor/schedule', icon: Clock },
          { name: 'Patients', path: '/doctor/patients', icon: Users },
          { name: 'My Profile', path: '/doctor/profile', icon: User },
        ];
      case 'patient':
        return [
          { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { name: 'Book Appointment', path: '/patient/book', icon: CalendarPlus },
          { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
          { name: 'Find Doctors', path: '/doctors', icon: UserCheck },
          { name: 'Medical Profile', path: '/patient/profile', icon: User },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const roleBadge = {
    admin: { label: 'Administrator', icon: Shield, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    doctor: { label: 'Physician / Staff', icon: Stethoscope, bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    patient: { label: 'Patient Portal', icon: HeartHandshake, bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  }[user?.role] || { label: 'User', icon: User, bg: 'bg-slate-50 text-slate-700 border-slate-200' };

  const RoleIcon = roleBadge.icon;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Care<span className="text-blue-600">Point</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Health System
              </span>
            </div>
          </div>

          {/* User Role Card */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`
                }
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleBadge.bg}`}
                  >
                    <RoleIcon className="w-3 h-3" />
                    <span>{roleBadge.label}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
