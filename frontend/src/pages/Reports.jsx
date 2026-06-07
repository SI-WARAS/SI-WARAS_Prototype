import { useState, useEffect } from 'react';
import { Download, Settings, Calendar, MapPin, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';

const DEMOGRAPHIC_FIELDS = [
  { id: 'nama', label: 'Nama Lengkap' },
  { id: 'nik', label: 'NIK' },
  { id: 'umur', label: 'Umur' },
  { id: 'gender', label: 'Jenis Kelamin' },
  { id: 'alamat', label: 'Alamat Lengkap' },
  { id: 'telepon', label: 'No. Telepon' },
  { id: 'pedukuhan', label: 'Pedukuhan (Tenant)' }
];

const MEDICAL_FIELDS = [
  { id: 'bloodPressure', label: 'Tekanan Darah (Tensi)' },
  { id: 'bloodSugar', label: 'Gula Darah' },
  { id: 'cholesterol', label: 'Kolesterol' },
  { id: 'uricAcid', label: 'Asam Urat' },
  { id: 'weight', label: 'Berat Badan' },
  { id: 'height', label: 'Tinggi Badan' },
  { id: 'bmi', label: 'IMT (BMI)' },
  { id: 'smokingStatus', label: 'Status Merokok' },
  { id: 'activityLevel', label: 'Aktivitas Fisik' },
  { id: 'notes', label: 'Catatan Medis' },
  { id: 'isRisk', label: 'Status Risiko PTM' }
];

const Reports = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  // Custom Export States
  const [selectedFields, setSelectedFields] = useState([
    'nama', 'nik', 'umur', 'gender', 'pedukuhan', 'bloodPressure', 'bloodSugar', 'isRisk'
  ]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pedukuhanFilter, setPedukuhanFilter] = useState('');
  const [pedukuhans, setPedukuhans] = useState([]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      api.get('/patients/pedukuhans')
        .then(res => setPedukuhans(res.data))
        .catch(err => console.error('Gagal memuat daftar pedukuhan', err));
    }
  }, [user]);

  const handleFieldToggle = (fieldId) => {
    if (selectedFields.includes(fieldId)) {
      if (selectedFields.length === 1) {
        toast.error('Pilih minimal satu kolom untuk diekspor!');
        return;
      }
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const handleSelectAllFields = () => {
    const allIds = [...DEMOGRAPHIC_FIELDS.map(f => f.id), ...MEDICAL_FIELDS.map(f => f.id)];
    setSelectedFields(allIds);
  };

  const handleClearAllFields = () => {
    setSelectedFields(['nama']); // Keep at least one
  };

  const handleCustomExport = async (e) => {
    e.preventDefault();
    setIsExporting(true);
    try {
      const response = await api.post('/medis/export', {
        fields: selectedFields,
        filters: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          pedukuhanId: user.role === 'ADMIN' ? (pedukuhanFilter || undefined) : undefined
        }
      });

      const records = response.data;
      if (records.length === 0) {
        toast.error('Tidak ditemukan rekam medis yang sesuai dengan kriteria filter.');
        return;
      }

      // Format records into flat objects with user-friendly headers
      const excelRows = records.map(record => {
        const row = {};
        
        // Always include date
        row['Tanggal Pemeriksaan'] = new Date(record.date).toLocaleDateString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });

        selectedFields.forEach(field => {
          if (field === 'nama') row['Nama Lengkap'] = record.patient?.name || '-';
          else if (field === 'nik') row['NIK'] = record.patient?.nik || '-';
          else if (field === 'umur') row['Umur'] = record.patient?.age || '-';
          else if (field === 'gender') row['Jenis Kelamin'] = record.patient?.gender === 'MALE' ? 'Laki-laki' : 'Perempuan';
          else if (field === 'alamat') row['Alamat Lengkap'] = record.patient?.address || '-';
          else if (field === 'telepon') row['No. Telepon'] = record.patient?.phone || '-';
          else if (field === 'pedukuhan') row['Pedukuhan'] = record.patient?.pedukuhan?.name || '-';
          
          else if (field === 'bloodPressure') {
            row['Tekanan Darah'] = record.bloodPressure || '-';
            row['Status Tekanan Darah'] = (record.bloodPressureStatus || 'Normal').toUpperCase();
          }
          else if (field === 'bloodSugar') {
            row['Gula Darah (mg/dL)'] = record.bloodSugar || 0;
            row['Status Gula Darah'] = (record.bloodSugarStatus || 'Normal').toUpperCase();
          }
          else if (field === 'cholesterol') {
            row['Kolesterol (mg/dL)'] = record.cholesterol || 0;
            row['Status Kolesterol'] = (record.cholesterolStatus || 'Normal').toUpperCase();
          }
          else if (field === 'uricAcid') {
            row['Asam Urat (mg/dL)'] = record.uricAcid || 0;
            row['Status Asam Urat'] = (record.uricAcidStatus || 'Normal').toUpperCase();
          }
          else if (field === 'weight') row['Berat Badan (kg)'] = record.weight || 0;
          else if (field === 'height') row['Tinggi Badan (cm)'] = record.height || 0;
          else if (field === 'bmi') row['IMT (BMI)'] = record.bmi || 0;
          else if (field === 'smokingStatus') row['Status Merokok'] = record.smokingStatus ? 'Ya' : 'Tidak';
          else if (field === 'activityLevel') row['Aktivitas Fisik'] = record.activityLevel || '-';
          else if (field === 'notes') row['Catatan Medis'] = record.notes || '-';
          else if (field === 'isRisk') row['Kasus Berisiko PTM'] = record.isRisk ? 'YA (RISIKO)' : 'TIDAK';
        });

        return row;
      });

      // Excel processing
      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Medis SI-WARAS');

      // Style adjustments (column widths)
      const maxLens = {};
      excelRows.forEach(row => {
        Object.keys(row).forEach(key => {
          const valStr = String(row[key] || '');
          maxLens[key] = Math.max(maxLens[key] || key.length, valStr.length);
        });
      });
      worksheet['!cols'] = Object.keys(maxLens).map(key => ({ wch: maxLens[key] + 4 }));

      // Save
      XLSX.writeFile(workbook, `SIWARAS_Custom_Report_${new Date().getTime()}.xlsx`);
      toast.success('Laporan kustom berhasil diunduh dalam format Excel!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunduh laporan kustom.');
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan & Analitik</h1>
          <p className="text-[13px] text-slate-500 mt-1">Buat, ekspor, dan filter laporan data kesehatan desa.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] shadow-soft border border-slate-100/50 p-6 md:p-8 space-y-6"
      >
        <form onSubmit={handleCustomExport} className="space-y-6">
          
          {/* Row 1: Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" /> Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" /> Tanggal Selesai
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> Wilayah Pedukuhan
              </label>
              {user.role === 'ADMIN' ? (
                <select
                  value={pedukuhanFilter}
                  onChange={(e) => setPedukuhanFilter(e.target.value)}
                  className="w-full text-[13px] border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-slate-50/50 focus:bg-white transition-colors"
                >
                  <option value="">Semua Wilayah</option>
                  {pedukuhans.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <div className="w-full text-[13px] border border-slate-100 rounded-lg p-2.5 bg-slate-50 text-slate-500 flex items-center font-medium">
                  {user.pedukuhanId ? 'Wilayah Terkunci (Tenant)' : 'Semua Wilayah'}
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Row 2: Checkbox Matrix */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-[14px] font-bold text-slate-800 flex items-center">
                <Settings className="w-4 h-4 mr-1.5 text-rose-500" /> Pilih Kolom Ekspor (.xlsx)
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllFields}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleClearAllFields}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-600 bg-slate-100 px-2.5 py-1 rounded"
                >
                  Bersihkan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demographics Group */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">Biodata / Demografi Pasien</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEMOGRAPHIC_FIELDS.map(field => {
                    const isSelected = selectedFields.includes(field.id);
                    return (
                      <label 
                        key={field.id} 
                        onClick={() => handleFieldToggle(field.id)}
                        className={`flex items-center p-2 rounded-lg border text-[13px] cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-white border-rose-200 text-rose-700 font-medium shadow-sm' 
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 mr-2.5 rounded flex items-center justify-center border transition-all ${
                          isSelected 
                            ? 'bg-rose-500 border-rose-500 text-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        {field.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Medical Stats Group */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">Pemeriksaan / Riwayat Medis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MEDICAL_FIELDS.map(field => {
                    const isSelected = selectedFields.includes(field.id);
                    return (
                      <label 
                        key={field.id} 
                        onClick={() => handleFieldToggle(field.id)}
                        className={`flex items-center p-2 rounded-lg border text-[13px] cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-white border-rose-200 text-rose-700 font-medium shadow-sm' 
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 mr-2.5 rounded flex items-center justify-center border transition-all ${
                          isSelected 
                            ? 'bg-rose-500 border-rose-500 text-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        {field.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isExporting}
              className="flex items-center justify-center px-6 py-3 text-[13px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Memproses Ekspor...' : <><Download className="w-4 h-4 mr-2" /> Ekspor Kustom (.xlsx)</>}
            </button>
          </div>

        </form>
      </motion.div>
    </motion.div>
  );
};

export default Reports;
