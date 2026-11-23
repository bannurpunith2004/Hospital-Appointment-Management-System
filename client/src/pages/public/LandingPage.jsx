import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  UserCheck,
  Clock,
  ShieldCheck,
  ArrowRight,
  Star,
  CheckCircle2,
  Activity,
  Heart,
  Brain,
  Bone,
  Baby,
  Sparkles,
  Stethoscope,
  Smile,
  ChevronDown,
  Building2,
  Users,
  Award,
  FileText,
  Download,
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';

const iconMap = {
  Heart: Heart,
  Brain: Brain,
  Bone: Bone,
  Baby: Baby,
  Sparkles: Sparkles,
  Stethoscope: Stethoscope,
  Smile: Smile,
  Activity: Activity,
};

export const LandingPage = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faqOpen, setFaqOpen] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, deptRes] = await Promise.all([
          doctorService.getAll({ limit: 4, sortBy: 'rating' }),
          departmentService.getAll({ activeOnly: 'true' }),
        ]);
        if (docRes.success) setFeaturedDoctors(docRes.data || []);
        if (deptRes.success) setDepartments(deptRes.data || []);
      } catch (err) {
        console.warn('Could not load landing preview:', err.message);
      }
    };
    fetchData();
  }, []);

  const faqs = [
    {
      q: 'How quickly is my appointment confirmed?',
      a: 'With CarePoint, slots are reserved instantly in real-time. The doctor or clinical department confirms your scheduled consultation right from their digital dashboard, and you receive instant confirmation.',
    },
    {
      q: 'Can I reschedule or cancel if my schedule changes?',
      a: 'Yes, patients can easily reschedule or cancel appointments directly from their Patient Portal at any time prior to the consultation slot without any penalty.',
    },
    {
      q: 'Are all CarePoint doctors board-certified specialists?',
      a: 'Absolutely. Every physician in the CarePoint network undergoes rigorous credentialing, background validation, and board-certification verification before practicing.',
    },
    {
      q: 'How does duplicate booking prevention work?',
      a: 'Our smart scheduling engine continuously syncs with the doctors calendar. Once a time slot is chosen, it is locked so no two patients can ever be double-booked for the same time.',
    },
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-blue-50/60 via-white to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold tracking-wide border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Next-Generation Healthcare Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Your Health, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-700 to-blue-800">
                  Our Priority.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                CarePoint delivers world-class medical appointments with top board-certified
                specialists. Check real-time doctor availability, avoid hospital waiting rooms,
                and receive exceptional clinical care with zero friction.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/patient/book"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-700 text-white font-bold text-base shadow-lg shadow-blue-600/25 hover:from-blue-700 hover:to-teal-800 hover:shadow-xl transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/doctors"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white text-slate-700 font-bold text-base border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-all"
                >
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span>Explore Specialists</span>
                </Link>

                <a
                  href="/CarePoint_Project_Report.pdf"
                  download="CarePoint_Project_Report.pdf"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-50 text-blue-800 font-bold text-base border border-blue-200 shadow-sm hover:bg-blue-100 hover:border-blue-300 transition-all"
                  title="Download Official 6-Page Academic Project Report"
                >
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Report PDF</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-black text-slate-900">99.4%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Patient Satisfaction</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">50+</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Top Physicians</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">&lt; 15 min</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Average Wait Time</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background glow */}
                <div className="absolute -top-6 -left-6 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />

                {/* Main Card */}
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-6">
                  {/* Doctor badge float */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                        CP
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">CarePoint Health Plaza</h4>
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          Live Availability & Booking
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                      JCI Certified
                    </span>
                  </div>

                  {/* Doctor sample preview */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80"
                      alt="Doctor"
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                          Cardiology
                        </span>
                        <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>4.9</span>
                        </div>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 truncate">
                        Dr. Marcus Reynolds
                      </h5>
                      <p className="text-xs text-slate-500 truncate">14+ Years Experience</p>
                    </div>
                  </div>

                  {/* Available times snippet */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Available Consultation Slots Today:</span>
                      <span className="text-teal-700 font-bold">3 Slots Open</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="py-2 text-center text-xs font-bold text-blue-700 bg-blue-50 rounded-xl border border-blue-200">
                        09:00 AM
                      </span>
                      <span className="py-2 text-center text-xs font-bold text-blue-700 bg-blue-50 rounded-xl border border-blue-200">
                        11:30 AM
                      </span>
                      <span className="py-2 text-center text-xs font-bold text-blue-700 bg-blue-50 rounded-xl border border-blue-200">
                        03:00 PM
                      </span>
                    </div>
                  </div>

                  {/* Bottom trust point */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs font-medium text-emerald-800">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Zero duplicate booking guarantee with automated slot locks.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STATS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-400">25,000+</p>
              <p className="text-sm text-slate-400 mt-1 font-medium">Patients Treated</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-teal-400">10+</p>
              <p className="text-sm text-slate-400 mt-1 font-medium">Medical Departments</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400">99.8%</p>
              <p className="text-sm text-slate-400 mt-1 font-medium">Verified Clean Diagnoses</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">24 / 7</p>
              <p className="text-sm text-slate-400 mt-1 font-medium">Emergency Care Coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CLINICAL DEPARTMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Specialized Care
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Browse Clinical Departments
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              From pediatric wellness to complex interventional cardiology, our hospital houses
              state-of-the-art facilities across all vital medical disciplines.
            </p>
          </div>
          <Link
            to="/departments"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 group"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(departments.slice(0, 8)).map((dept) => {
            const IconComp = iconMap[dept.icon] || Activity;
            return (
              <Link
                key={dept._id}
                to={`/doctors?department=${dept._id}`}
                className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-card hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {dept.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-blue-600">
                  <span>{dept.doctorCount || 1}+ Doctors Available</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED DOCTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Elite Medical Staff
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Meet Our Leading Specialists
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Consult with board-certified physicians dedicated to compassionate patient outcomes
              and personalized treatment plans.
            </p>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 group"
          >
            <span>Browse Full Directory</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-card transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={
                      doc.user?.avatar ||
                      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
                    }
                    alt={doc.user?.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span>{doc.rating?.toFixed(1) || '4.9'}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shadow-sm">
                    {doc.department?.name || 'Specialist'}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h4 className="text-base font-bold text-slate-900">{doc.user?.name}</h4>
                  <p className="text-xs text-teal-700 font-semibold">{doc.specialization}</p>
                  <p className="text-xs text-slate-400">
                    {doc.experienceYears} Years Exp • {doc.roomNumber || 'Main Clinic'}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-50 mt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Consult Fee</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ${doc.consultationFee}
                  </span>
                </div>
                <Link
                  to={`/patient/book?doctorId=${doc._id}`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Slot</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
              Frictionless Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How CarePoint Works
            </h2>
            <p className="text-slate-500 text-sm">
              Schedule your hospital visit in under 2 minutes through our verified digital portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-black shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Choose Specialist & Department</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by cardiology, neurology, pediatrics, or general medicine. Inspect ratings,
                credentials, and consultation fees upfront.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto text-xl font-black shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Select an Open Time Slot</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pick your preferred date. Our live calendar ensures duplicate booking prevention and
                displays strictly available consultation slots.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-black shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Instant Confirmed Care</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive instant confirmation on your dashboard, check in smoothly, and review
                prescriptions & clinical notes in your digital portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Why CarePoint
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Transforming Hospital Visits Into Seamless Experiences
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Traditional healthcare scheduling is plagued by double bookings, long waiting room
              hours, and disconnected medical histories. CarePoint brings modern hospital SaaS
              intelligence directly to patients and physicians.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Real-Time Duplicate Prevention</h4>
                  <p className="text-xs text-slate-500">
                    Proprietary calendar syncing prevents overlapping appointments for the same doctor,
                    date, and time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Integrated Digital Records</h4>
                  <p className="text-xs text-slate-500">
                    Track allergies, blood group, emergency contacts, and past doctor prescriptions in
                    one secure HIPAA-compliant profile.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Multi-Role Hospital Dashboards</h4>
                  <p className="text-xs text-slate-500">
                    Tailored portals for administrators to manage operations, doctors to conduct
                    queues, and patients to manage their health journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="bg-gradient-to-tr from-blue-600 to-teal-700 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
                <Award className="w-4 h-4 text-amber-300" />
                <span>Premier Hospital Center of Excellence</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Compassionate Clinical Care Supported by Modern Technology
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                Whether you need routine preventive advice or emergency interventional therapy, our
                clinical teams are equipped to serve you around the clock.
              </p>
              <div className="pt-4 flex items-center gap-4">
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 transition-colors shadow-md"
                >
                  Create Patient Account
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white text-sm font-bold border border-white/20 transition-colors"
                >
                  Emergency Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-sm">
            Everything you need to know about booking and managing hospital appointments at CarePoint.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(isOpen ? -1 : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-slate-800 hover:text-blue-600 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
