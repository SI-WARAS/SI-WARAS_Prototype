import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Activity, Heart, Scale, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/axios';
import { motion } from 'framer-motion';

const getBPStatus = (bp) => {
  if (!bp) return 'normal';
  const [sys, dia] = bp.split('/').map(Number);
  if (sys > 140 || dia > 90) return 'danger';
  if (sys > 120 || dia > 80) return 'warning';
  return 'normal';
};

const getBSStatus = (bs) => {
  if (bs > 200) return 'danger';
  if (bs > 140) return 'warning';
  return 'normal';
};

const StatusBadge = ({ status, text }) => {
  const styles = {
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${styles[status]}`}>
      {text || status}
    </span>
  );
};

import { useAuth } from '../context/AuthContext';

const Records = () => {
  const { user } = useAuth();
  
  const getBasePath = (role) => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'HEALTH_WORKER') return '/petugas';
    if (role === 'VILLAGE_HEAD') return '/kepala-desa';
    return '';
  };
  const basePath = getBasePath(user?.role);

  const { data: records, isLoading } = useQuery({
    queryKey: ['allRecords'],
    queryFn: async () => {
      const { data } = await api.get('/records');
      return data;
    }
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Medical Records</h1>
          <p className="text-[13px] text-slate-500 mt-1">Global feed of all recent medical checkups.</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Loading records...</div>
        ) : records?.length === 0 ? (
          <div className="bg-white rounded-[20px] shadow-soft border border-slate-100/50 p-12 text-center text-slate-400 text-[13px] font-medium flex flex-col items-center justify-center">
            <Activity className="w-8 h-8 text-slate-200 mb-3" />
            No medical records found.
          </div>
        ) : (
          records?.map((record) => {
            const bpStatus = getBPStatus(record.bloodPressure);
            const bsStatus = getBSStatus(record.bloodSugar);

            return (
              <div key={record.id} className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 hover:border-rose-100 transition-colors group">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                       <Calendar className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-slate-800 mr-2">{record.patient?.name}</span>
                      <span className="text-[12px] font-medium text-slate-400">
                        {format(new Date(record.date), 'dd MMM yyyy, HH:mm')}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`${basePath}/patients/${record.patientId}`}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="View Patient"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6">
                  <div>
                    <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <Heart className="w-3 h-3 mr-1" /> BP
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[15px]">{record.bloodPressure}</span>
                      <StatusBadge status={bpStatus} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <Activity className="w-3 h-3 mr-1" /> Sugar
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[15px]">{record.bloodSugar}</span>
                      <StatusBadge status={bsStatus} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                      Cholesterol
                    </div>
                    <span className="font-semibold text-slate-800 text-[15px]">{record.cholesterol}</span>
                  </div>

                  <div>
                    <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <Scale className="w-3 h-3 mr-1" /> BMI
                    </div>
                    <span className="font-semibold text-slate-800 text-[15px]">{record.weight}kg / {record.height}cm</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default Records;
