import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { Users, AlertCircle, Heart, Activity, Calendar, LayoutGrid, Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const fetchStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getBasePath } from '../utils/roleHelpers';
import toast from 'react-hot-toast';
import { exportDashboardToPDF } from '../utils/exportUtils';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, colorClass, changeStr, isPositive, to }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-white rounded-[20px] p-5 shadow-soft border border-slate-100/50 flex flex-col justify-between hover:border-brand-primary/30 transition-colors cursor-pointer"
  >
    <Link to={to} className="h-full flex flex-col justify-between outline-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[13px] font-semibold text-slate-600">{title}</h3>
        <div className={`text-opacity-80 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <h3 className="text-[28px] font-bold text-slate-800 tracking-tight">{value}</h3>
          <div className={`flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-brand-primary bg-brand-light/30'}`}>
            {isPositive ? '↑' : '↓'} {changeStr}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">vs periode lalu</p>
      </div>
    </Link>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const basePath = getBasePath(user?.role);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchStats,
  });

  const handleExport = () => {
    try {
      exportDashboardToPDF(data);
      toast.success('Laporan dashboard berhasil diekspor!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengekspor laporan');
    }
  };

  const handleAddWidget = () => {
    toast('Kustomisasi widget akan segera hadir.', { icon: '🚧' });
  };

  const handleChartMenu = () => {
    toast('Pilihan grafik tersedia di versi premium.', { icon: '🔒' });
  };

  if (isLoading) return <div className="p-8 text-slate-400 font-medium animate-pulse">Memuat dashboard...</div>;
  if (isError) return <div className="p-8 text-brand-primary font-medium">Gagal memuat data dashboard.</div>;

  const { totalPatients, ptmCases, areaStats } = data;

  const doughnutData = {
    labels: ['Hipertensi', 'Diabetes', 'Kolesterol', 'Asam Urat', 'Lainnya'],
    datasets: [
      {
        data: [
          ptmCases.hypertension, 
          ptmCases.diabetes, 
          ptmCases.cholesterol, 
          ptmCases.uricAcid, 
          ptmCases.other
        ],
        backgroundColor: ['#C2185B', '#FF4081', '#F06292', '#BA68C8', '#cbd5e1'],
        hoverBackgroundColor: ['#880E4F', '#f50057', '#ec407a', '#9c27b0', '#94a3b8'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  const barData = {
    labels: Object.keys(areaStats),
    datasets: [
      {
        label: 'Pasien',
        data: Object.values(areaStats),
        backgroundColor: '#FF80AB', // Light bright pink
        hoverBackgroundColor: '#FF4081',
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [
      {
        label: 'Pasien Baru',
        data: [5, 12, 18, 15, 25, totalPatients],
        borderColor: '#C2185B', // New Primary
        backgroundColor: 'rgba(194, 24, 91, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#9E1F63',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: 'Inter', size: 13, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12, weight: 'medium' },
        cornerRadius: 12,
        displayColors: false,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: '#f8fafc', borderDash: [4, 4] }, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }, border: { display: false } }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header Section matching reference */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-600 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>1 Jan 2026 - {format(new Date(), 'd MMM yyyy')}</span>
            <span className="ml-2 pl-2 border-l border-slate-200 text-brand-primary font-bold tabular-nums">{format(currentTime, 'HH:mm:ss')}</span>
          </div>
          <button onClick={handleAddWidget} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-all outline-none">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
            Tambah widget
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-1.5 rounded-lg text-[12px] font-medium shadow-sm transition-all outline-none">
            <Download className="w-3.5 h-3.5" />
            Ekspor
          </button>
        </div>
      </div>

      {/* Summary Stat */}
      <div className="bg-white px-6 py-4 rounded-[20px] shadow-soft border border-slate-100/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pasien Terdaftar</p>
            <h3 className="text-xl font-bold text-slate-800">{totalPatients} Pasien</h3>
          </div>
        </div>
        <div className="flex gap-8">
           <div className="text-right">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Risiko Tinggi</p>
              <h3 className="text-lg font-bold text-brand-primary">{ptmCases.hypertension + ptmCases.diabetes + ptmCases.cholesterol + ptmCases.uricAcid}</h3>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Kasus Hipertensi" 
          value={ptmCases.hypertension} 
          icon={Heart} 
          colorClass="text-[#C2185B]" 
          changeStr="4.2%"
          isPositive={false}
          to={`${basePath}/records`}
        />
        <StatCard 
          title="Kasus Diabetes" 
          value={ptmCases.diabetes} 
          icon={Activity} 
          colorClass="text-[#FF4081]" 
          changeStr="8.1%"
          isPositive={true}
          to={`${basePath}/records`}
        />
        <StatCard 
          title="Kasus Kolesterol" 
          value={ptmCases.cholesterol} 
          icon={Activity} 
          colorClass="text-[#F06292]" 
          changeStr="2.5%"
          isPositive={true}
          to={`${basePath}/records`}
        />
        <StatCard 
          title="Kasus Asam Urat" 
          value={ptmCases.uricAcid} 
          icon={Activity} 
          colorClass="text-[#BA68C8]" 
          changeStr="3.1%"
          isPositive={false}
          to={`${basePath}/records`}
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (takes 2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[15px] font-bold text-slate-800">Pertumbuhan Pasien</h3>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-2xl font-bold text-slate-800">{totalPatients}</span>
                  <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center mb-1">
                    ↑ 24.4% <span className="text-slate-400 font-normal ml-1">vs tahun lalu</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="h-[280px]">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Right Column (takes 1/3 width) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-slate-800">Distribusi Penyakit</h3>
              <button onClick={handleChartMenu} className="text-slate-400 hover:text-slate-600 px-2 rounded-md hover:bg-slate-50 transition-colors outline-none">•••</button>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-[180px] flex justify-center items-center relative">
                <Doughnut 
                  data={doughnutData} 
                  options={{
                    ...chartOptions,
                    cutout: '75%',
                    scales: {
                      x: { display: false },
                      y: { display: false }
                    }
                  }} 
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[24px] font-bold text-slate-800">{ptmCases.hypertension + ptmCases.diabetes + ptmCases.cholesterol + ptmCases.uricAcid}</span>
                  <span className="text-[11px] text-slate-400 font-medium">Kasus Risiko</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-6">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#C2185B]"></div><span className="text-[11px] font-bold text-slate-600">Hipertensi</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF4081]"></div><span className="text-[11px] font-bold text-slate-600">Diabetes</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F06292]"></div><span className="text-[11px] font-bold text-slate-600">Kolesterol</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#BA68C8]"></div><span className="text-[11px] font-bold text-slate-600">Asam Urat</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Area */}
      <div className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[14px] font-bold text-slate-800">Kasus Berdasarkan Wilayah (Padukuhan)</h3>
          <button onClick={handleChartMenu} className="text-slate-400 hover:text-slate-600 px-2 rounded-md hover:bg-slate-50 transition-colors outline-none">•••</button>
        </div>
        <div className="h-[220px]">
          <Bar data={barData} options={{...chartOptions, maintainAspectRatio: false}} />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
