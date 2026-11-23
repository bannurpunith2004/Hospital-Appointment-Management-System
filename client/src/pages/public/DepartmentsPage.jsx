import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { departmentService } from '../../services/departmentService';
import {
  Building2,
  Heart,
  Brain,
  Bone,
  Baby,
  Sparkles,
  Stethoscope,
  Eye,
  Smile,
  UserCheck,
  Mic,
  Activity,
  ArrowRight,
  Users,
} from 'lucide-react';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const iconMap = {
  Heart: Heart,
  Brain: Brain,
  Bone: Bone,
  Baby: Baby,
  Sparkles: Sparkles,
  Stethoscope: Stethoscope,
  Eye: Eye,
  Smile: Smile,
  UserCheck: UserCheck,
  Mic: Mic,
  Activity: Activity,
};

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentService.getAll({ activeOnly: 'true' });
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-blue-800 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-teal-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
            Clinical Excellence Centers
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Comprehensive Hospital Departments
          </h1>
          <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
            CarePoint houses specialized medical departments led by experienced department heads,
            supported by top diagnostic infrastructure and compassionate clinical teams.
          </p>
        </div>
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => {
            const IconComp = iconMap[dept.icon] || Activity;
            return (
              <div
                key={dept._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-card hover:border-blue-200 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {dept.image && (
                    <div className="h-44 overflow-hidden relative">
                      <img
                        src={dept.image}
                        alt={dept.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 text-white">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md">
                          {dept.doctorCount || 1} Specialist(s)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {dept.name}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {dept.description}
                    </p>

                    {dept.headDoctorName && (
                      <p className="text-xs text-slate-500 pt-2 border-t border-slate-50 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">Head of Department:</span>
                        <span>{dept.headDoctorName}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={`/doctors?department=${dept._id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <span>View Specialists in {dept.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
