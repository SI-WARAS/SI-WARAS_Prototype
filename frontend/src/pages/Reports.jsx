import { useState } from 'react';
import { Download, FileText, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Reports = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (type) => {
    setIsExporting(true);
    // Simulate API export delay
    setTimeout(() => {
      setIsExporting(false);
      toast.success(`${type} report exported successfully!`);
      // Mock download action
      const element = document.createElement("a");
      const file = new Blob(["mock data"], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${type.toLowerCase().replace(' ', '_')}_report.csv`;
      document.body.appendChild(element);
      element.click();
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reports & Analytics</h1>
        <p className="text-[13px] text-slate-500 mt-1">Generate and export system data for offline analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-2">Patient Directory</h3>
          <p className="text-[13px] text-slate-500 mb-6">Complete list of registered patients, demographics, and contact info.</p>
          <button 
            onClick={() => handleExport('Patient')}
            disabled={isExporting}
            className="mt-auto w-full flex justify-center items-center px-4 py-2.5 text-[13px] font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm outline-none disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : <><Download className="w-4 h-4 mr-2" /> Export CSV</>}
          </button>
        </div>

        <div className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-2">Medical Logs</h3>
          <p className="text-[13px] text-slate-500 mb-6">Detailed medical history, checkup results, and vital signs across all patients.</p>
          <button 
            onClick={() => handleExport('Medical')}
            disabled={isExporting}
            className="mt-auto w-full flex justify-center items-center px-4 py-2.5 text-[13px] font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm outline-none disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : <><Download className="w-4 h-4 mr-2" /> Export CSV</>}
          </button>
        </div>

        <div className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-2">System Summary</h3>
          <p className="text-[13px] text-slate-500 mb-6">High-level aggregated statistics, NCD (PTM) counts, and demographic distributions.</p>
          <button 
            onClick={() => handleExport('System')}
            disabled={isExporting}
            className="mt-auto w-full flex justify-center items-center px-4 py-2.5 text-[13px] font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm outline-none disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : <><Download className="w-4 h-4 mr-2" /> Export PDF</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;
