import React from 'react';
import {
  Award,
  ShieldCheck,
  Heart,
  Users,
  Building2,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
          About CarePoint Health System
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Pioneering Compassionate Clinical Care & Digital Convenience
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Founded with a patient-first mission, CarePoint integrates elite medical acumen with
          state-of-the-art digital infrastructure to eliminate scheduling friction, double bookings,
          and unnecessary delays.
        </p>
      </div>

      {/* Hospital Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Patient-Centric Mission</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every clinical decision, schedule slot, and diagnostic pathway is crafted to prioritize
            dignity, comfort, and personalized health outcomes.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Clinical Distinction</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our physicians represent premier medical institutions, bringing decades of published research,
            fellowship credentials, and surgical leadership.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Digital Health Security</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            From patient portal authentication to electronic prescriptions, our system meets
            stringent HIPAA and JCI encryption benchmarks.
          </p>
        </div>
      </div>

      {/* Leadership & Facility Stats */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
            Accreditation & Standards
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Certified by Leading Global Health Organizations
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            CarePoint maintains full Joint Commission International (JCI) accreditation, recognized
            as the gold standard in global healthcare quality, patient safety, and clinical governance.
          </p>
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Board Certified Medical Staff</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full Electronic Health Record (EHR) Integration</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>24/7 Rapid Response Cardiac & Neuro-Trauma Unit</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
            <p className="text-3xl font-black text-blue-400">25k+</p>
            <p className="text-xs text-slate-400 mt-1">Patients Served</p>
          </div>
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
            <p className="text-3xl font-black text-teal-400">14+</p>
            <p className="text-xs text-slate-400 mt-1">Average Years Exp</p>
          </div>
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
            <p className="text-3xl font-black text-indigo-400">10</p>
            <p className="text-xs text-slate-400 mt-1">Specialties</p>
          </div>
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
            <p className="text-3xl font-black text-emerald-400">99%</p>
            <p className="text-xs text-slate-400 mt-1">Positive Reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
};
