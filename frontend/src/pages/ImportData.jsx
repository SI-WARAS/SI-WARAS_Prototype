import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileDown, CheckCircle2, AlertTriangle, FileSpreadsheet, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const ImportData = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorReport, setErrorReport] = useState([]);
  const [successCount, setSuccessCount] = useState(0);
  const fileInputRef = useRef(null);

  const handleDownloadTemplate = () => {
    // Generate template
    const templateData = [{
      nik: "3402160101780001",
      name: "Budi Santoso",
      age: 45,
      gender: "MALE",
      address: "Dusun Gluntung Kidul RT 01",
      phone: "081234567890",
      pedukuhanName: "Gluntung Kidul",
      date: "2026-06-06",
      bloodPressure: "120/80",
      bloodSugar: 110,
      cholesterol: 180,
      uricAcid: 5.5,
      weight: 65,
      height: 165,
      smokingStatus: false,
      activityLevel: "MODERATE",
      notes: "Contoh pengisian sehat"
    }];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import');
    
    // Style adjustments
    const wscols = [
      {wch: 20}, {wch: 20}, {wch: 10}, {wch: 10}, {wch: 30}, {wch: 15}, {wch: 20},
      {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 10}, {wch: 10},
      {wch: 15}, {wch: 15}, {wch: 30}
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, "Template_Import_SIWARAS.xlsx");
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.name.endsWith('.xlsx') || selected.name.endsWith('.xls')) {
        setFile(selected);
        setStatus('idle');
      } else {
        toast.error('Harap unggah file Excel (.xlsx atau .xls)');
        e.target.value = null;
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith('.xlsx') || dropped.name.endsWith('.xls'))) {
      setFile(dropped);
      setStatus('idle');
    } else {
      toast.error('Harap unggah file Excel (.xlsx atau .xls)');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('loading');
    setErrorReport([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/medis/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Extract count from message "Berhasil mengimpor X data..."
      const match = response.data.message.match(/(\d+)/);
      setSuccessCount(match ? parseInt(match[1]) : 0);
      setStatus('success');
      toast.success('Impor berhasil diselesaikan!');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.details) {
        setErrorReport(error.response.data.details);
        setStatus('error');
        toast.error('Validasi gagal. Cek laporan kesalahan di bawah.');
      } else {
        setStatus('idle');
        toast.error(error.response?.data?.error || 'Gagal mengimpor data.');
      }
    }
  };

  const resetState = () => {
    setFile(null);
    setStatus('idle');
    setErrorReport([]);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Import Data Massal</h1>
          <p className="text-[13px] text-slate-500 mt-1">Unggah ribuan data rekam medis sekaligus melalui file Excel.</p>
        </div>
        <button 
          onClick={handleDownloadTemplate}
          className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 text-[13px] font-semibold rounded-lg transition-colors shadow-sm outline-none"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Unduh Template Resmi
        </button>
      </div>

      <AnimatePresence mode="wait">
        {(status === 'idle' || status === 'loading') && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[24px] p-8 md:p-12 shadow-soft border border-slate-100/50 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {status === 'loading' ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-6"></div>
                <h3 className="text-lg font-bold text-slate-800">Memproses Data...</h3>
                <p className="text-[13px] text-slate-500 mt-2 text-center max-w-sm">
                  Sistem sedang memvalidasi struktur data dan menghitung kalkulasi klinis. Mohon tunggu.
                </p>
              </div>
            ) : (
              <>
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-colors ${file ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  {file ? <FileSpreadsheet className="w-10 h-10" /> : <UploadCloud className="w-10 h-10" />}
                </div>
                
                {!file ? (
                  <>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Pilih atau Tarik File Ke Sini</h3>
                    <p className="text-[13px] text-slate-500 text-center max-w-md mb-8">
                      Gunakan template resmi untuk mencegah kesalahan kolom. Maksimal ukuran file 10MB (Hanya format .xlsx atau .xls).
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept=".xlsx, .xls" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[14px] rounded-xl shadow-md transition-all hover:-translate-y-0.5 outline-none"
                    >
                      Cari File Komputer
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 truncate max-w-xs">{file.name}</h3>
                    <p className="text-[13px] text-slate-500 text-center max-w-md mb-8">
                      Ukuran: {(file.size / 1024).toFixed(2)} KB. File siap diproses.
                    </p>
                    <div className="flex gap-4">
                      <button 
                        onClick={resetState}
                        className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-[14px] rounded-xl shadow-sm transition-colors outline-none"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={handleUpload}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[14px] rounded-xl shadow-md transition-colors outline-none flex items-center"
                      >
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Mulai Import
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[24px] p-8 md:p-12 shadow-soft border border-slate-100/50 flex flex-col items-center justify-center min-h-[350px]"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-3">
              Sukses! {successCount} Data Berhasil Dimasukkan.
            </h2>
            <p className="text-[14px] text-slate-500 text-center max-w-md mb-8 leading-relaxed">
              Semua data telah lolos gerbang validasi dan tersimpan dengan aman melalui Atomic Transaction.
            </p>
            <button 
              onClick={resetState}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[14px] rounded-xl transition-colors outline-none"
            >
              Import File Lainnya
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-rose-50 rounded-[24px] p-8 border border-rose-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-rose-800 mb-2">Unggahan Ditolak!</h2>
                <p className="text-[14px] text-rose-600/90 leading-relaxed mb-4">
                  Prinsip <b>All-or-Nothing</b> diterapkan. Ditemukan {errorReport.length} baris dengan kesalahan. Tidak ada satupun data yang dimasukkan ke dalam database untuk mencegah korupsi data.
                </p>
                <button 
                  onClick={resetState}
                  className="px-5 py-2.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold text-[13px] rounded-xl transition-colors shadow-sm outline-none inline-flex items-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Perbaiki File & Unggah Ulang
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[20px] shadow-soft border border-slate-100/50 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-[15px] font-bold text-slate-800">Laporan Detail Kesalahan</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Baris Excel</th>
                      <th className="px-6 py-4">Nama Kolom & Jenis Kesalahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {errorReport.map((errItem, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors bg-white">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-[13px] font-bold">
                            Baris {errItem.row}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-600">
                          <ul className="list-disc pl-4 space-y-1">
                            {errItem.errors.map((msg, i) => (
                              <li key={i} className="text-rose-600 font-medium">{msg}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImportData;
