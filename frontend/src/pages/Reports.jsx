import { useState } from 'react';
import { Download, FileText, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { exportDashboardToPDF, exportPatientsToPDF, exportRecordsToPDF } from '../utils/exportUtils';

const Reports = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type) => {
    setIsExporting(true);
    try {
      if (type === 'Pasien') {
        const { data } = await api.get('/patients?limit=1000'); // Fetch all
        exportPatientsToPDF(data.patients);
      } else if (type === 'Medis') {
        const { data } = await api.get('/records');
        exportRecordsToPDF(data);
      } else if (type === 'Sistem') {
        const { data } = await api.get('/dashboard/stats');
        exportDashboardToPDF(data);
      }
      toast.success(`Laporan ${type} berhasil diekspor!`);
    } catch (error) {
      console.error(error);
      toast.error(`Gagal mengekspor laporan ${type}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan & Analitik</h1>
        <p className="text-[13px] text-slate-500 mt-1">Buat dan ekspor data sistem untuk analisis luring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-2">Direktori Pasien</h3>
          <p className="text-[13px] text-slate-500 mb-6">Daftar lengkap pasien terdaftar, demografi, dan info kontak.</p>
          <button 
            onClick={() => handleExport('Pasien')}
            disabled={isExporting}
            className="mt-auto w-full flex justify-center items-center px-4 py-2.5 text-[13px] font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm outline-none disabled:opacity-50"
          >
            {isExporting ? 'Mengekspor...' : <><Download className="w-4 h-4 mr-2" /> Ekspor PDF</>}
          </button>
        </div>

        <div className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-2">Log Medis</h3>
          <p className="text-[13px] text-slate-500 mb-6">Riwayat medis mendetail, hasil pemeriksaan, dan tanda vital di seluruh pasien.</p>
          <button 
            onClick={() => handleExport('Medis')}
            disabled={isExporting}
            className="mt-auto w-full flex justify-center items-center px-4 py-2.5 text-[13px] font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm outline-none disabled:opacity-50"
          >
            {isExporting ? 'Mengekspor...' : <><Download className="w-4 h-4 mr-2" /> Ekspor PDF</>}
          </button>
        </div>

        <div className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-2">Ringkasan Sistem</h3>
          <p className="text-[13px] text-slate-500 mb-6">Statistik gabungan tingkat tinggi, jumlah PTM, dan distribusi demografis.</p>
          <button 
            onClick={() => handleExport('Sistem')}
            disabled={isExporting}
            className="mt-auto w-full flex justify-center items-center px-4 py-2.5 text-[13px] font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm outline-none disabled:opacity-50"
          >
            {isExporting ? 'Mengekspor...' : <><Download className="w-4 h-4 mr-2" /> Ekspor PDF</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;
