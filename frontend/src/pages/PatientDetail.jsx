import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { format } from 'date-fns';
import { ArrowLeft, Plus, Activity, Heart, Scale, Edit2, Trash2, MapPin, Phone, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getBasePath } from '../utils/roleHelpers';

import AddRecordModal from '../components/medical/AddRecordModal';
import EditRecordModal from '../components/medical/EditRecordModal';
import DeleteRecordModal from '../components/medical/DeleteRecordModal';

const getBPStatus = (bp) => {
  if (!bp) return 'normal';
  const [sys, dia] = bp.split('/').map(Number);
  if (sys > 140 || dia > 90) return 'bahaya';
  if (sys > 120 || dia > 80) return 'waspada';
  return 'normal';
};

const getBSStatus = (bs) => {
  if (bs > 200) return 'bahaya';
  if (bs > 140) return 'waspada';
  return 'normal';
};

const StatusBadge = ({ status, text }) => {
  const styles = {
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    waspada: 'bg-amber-50 text-amber-700 border-amber-100',
    bahaya: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${styles[status]}`}>
      {text || status}
    </span>
  );
};

const PatientDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const basePath = getBasePath(user?.role);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecordId, setDeleteRecordId] = useState(null);

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${id}`);
      return data;
    }
  });

  const addMutation = useMutation({
    mutationFn: (newRecord) => api.post('/records', { ...newRecord, patientId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['patient', id]);
      toast.success('Rekam medis berhasil ditambahkan!');
      setIsAddModalOpen(false);
    },
    onError: () => toast.error('Gagal menambahkan rekam medis')
  });

  const editMutation = useMutation({
    mutationFn: ({ recordId, data }) => api.put(`/records/${recordId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['patient', id]);
      toast.success('Rekam medis berhasil diperbarui!');
      setEditRecord(null);
    },
    onError: () => toast.error('Gagal memperbarui rekam medis')
  });

  const deleteMutation = useMutation({
    mutationFn: (recordId) => api.delete(`/records/${recordId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['patient', id]);
      toast.success('Rekam medis berhasil dihapus!');
      setDeleteRecordId(null);
    },
    onError: () => toast.error('Gagal menghapus rekam medis')
  });

  const handleAdd = (data, resetForm) => {
    addMutation.mutate(data, {
      onSuccess: () => resetForm()
    });
  };

  const handleEdit = (recordId, data) => {
    editMutation.mutate({ recordId, data });
  };

  const handleDelete = (recordId) => {
    deleteMutation.mutate(recordId);
  };

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Memuat profil pasien...</div>;
  if (!patient) return <div className="p-8 text-rose-500">Pasien tidak ditemukan</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      <div className="flex items-center space-x-4 mb-2">
        <Link to={`${basePath}/patients`} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500 shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{patient.name}</h1>
          <p className="text-slate-400 font-mono text-[12px] mt-0.5">ID: {patient.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 lg:col-span-1 h-fit">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100/50">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-2xl">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800">{patient.name}</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">{patient.age} tahun • <span className="capitalize">{patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</span></p>
            </div>
          </div>
          
          <h3 className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wider">Kontak & Info</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Telepon</p>
                <p className="text-[13px] font-semibold text-slate-800">{patient.phone || 'Tidak tersedia'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Alamat</p>
                <p className="text-[13px] font-semibold text-slate-800 leading-relaxed">{patient.address}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Terdaftar</p>
                <p className="text-[13px] font-semibold text-slate-800">{format(new Date(patient.createdAt), 'dd MMM yyyy')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-800">Riwayat Medis</h3>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-rose-600 text-white text-[13px] font-medium rounded-lg hover:bg-rose-700 transition-colors shadow-sm outline-none"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Log
            </button>
          </div>

          <div className="space-y-4">
            {patient.medicalRecords?.length === 0 ? (
              <div className="bg-white rounded-[20px] shadow-soft border border-slate-100/50 p-12 text-center text-slate-400 text-[13px] font-medium flex flex-col items-center justify-center">
                <Activity className="w-8 h-8 text-slate-200 mb-3" />
                Tidak ada rekam medis ditemukan untuk pasien ini.
              </div>
            ) : (
              patient.medicalRecords?.map((record) => {
                const bpStatus = getBPStatus(record.bloodPressure);
                const bsStatus = getBSStatus(record.bloodSugar);

                return (
                  <div key={record.id} className="bg-white p-6 rounded-[20px] shadow-soft border border-slate-100/50 hover:border-rose-100 transition-colors group">
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100/50">
                      <span className="text-[13px] font-semibold text-slate-700 flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3">
                           <Calendar className="w-4 h-4 text-slate-400" />
                        </div>
                        {format(new Date(record.date), 'dd MMM yyyy, HH:mm')}
                      </span>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditRecord(record)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteRecordId(record.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6">
                      <div>
                        <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                          <Heart className="w-3 h-3 mr-1" /> T. Darah
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 text-[15px]">{record.bloodPressure}</span>
                          <StatusBadge status={bpStatus} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                          <Activity className="w-3 h-3 mr-1" /> G. Darah
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 text-[15px]">{record.bloodSugar}</span>
                          <StatusBadge status={bsStatus} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                          Kolesterol
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

                    {record.notes && (
                      <div className="mt-5 pt-4 border-t border-slate-50/50">
                        <p className="text-[13px] text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Catatan:</span> {record.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <AddRecordModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAdd} 
        isPending={addMutation.isPending} 
      />

      <EditRecordModal 
        record={editRecord} 
        onClose={() => setEditRecord(null)} 
        onEdit={handleEdit} 
        isPending={editMutation.isPending} 
      />

      <DeleteRecordModal 
        recordId={deleteRecordId} 
        onClose={() => setDeleteRecordId(null)} 
        onDelete={handleDelete} 
        isPending={deleteMutation.isPending} 
      />

    </motion.div>
  );
};

export default PatientDetail;
