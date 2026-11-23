import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import {
  Hospital,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Stethoscope,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      toast.success(`Welcome back, ${res.user.name}!`);

      // Role redirect
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        const roleRoutes = {
          admin: '/admin/dashboard',
          doctor: '/doctor/dashboard',
          patient: '/patient/dashboard',
        };
        navigate(roleRoutes[res.user.role] || '/', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your email & password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Auto-Fill
  const handleQuickLogin = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Branding Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-teal-900 p-8 sm:p-10 text-white flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
                <Hospital className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Care<span className="text-blue-300">Point</span>
              </span>
            </Link>

            <div className="space-y-2 pt-6">
              <span className="text-xs uppercase font-extrabold tracking-widest text-teal-300 bg-teal-400/20 px-3 py-1 rounded-full">
                Secure Hospital Portal
              </span>
              <h2 className="text-2xl font-black text-white leading-tight">
                Unified Clinical & Patient Access
              </h2>
              <p className="text-sm text-blue-100 leading-relaxed font-normal">
                Sign in to manage appointments, review patient records, update practice availability,
                or book a specialist consultation.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-xs text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero duplicate booking conflict algorithm</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Role-based access for Admin, Doctors, and Patients</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>HIPAA-compliant encrypted electronic records</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-xs text-blue-200">
            CarePoint Health System • Operational 24/7
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-8">
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter your credentials to access your CarePoint account.
              </p>
            </div>

            {/* Quick Demo Credentials Widget */}
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                1-Click Demo Evaluation Sign-In:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@carepoint.com', 'Admin@1234')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">Executive Suite</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('dr.reynolds@carepoint.com', 'Doctor@1234')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Doctor</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">Dr. Reynolds</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('patient@carepoint.com', 'Patient@1234')}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Patient</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">John Doe</span>
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    placeholder="name@carepoint.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-4 text-center text-xs text-slate-500 border-t border-slate-100">
            Don't have a patient account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Register as Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
