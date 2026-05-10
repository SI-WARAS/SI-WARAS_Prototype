import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, UserPlus, ChevronRight, Edit2, Trash2, Filter, ChevronLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from '../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { getBasePath } from '../utils/roleHelpers';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const PADUKUHAN_LIST = [
  'Gluntung Kidul', 'Gumulan', 'Tegalsempu', 'Tunjungan', 'Krapakan', 
  'Samparan', 'Tegallayang 9', 'Tegallayang 10', 'Kuroboyo', 'Korowelang', 
  'Glagahan', 'Bogem', 'Banyuurip', 'Gluntung Lor'
];

const Patients = () => {
  const { user } = useAuth();
  
  const basePath = getBasePath(user?.role);

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilter, setShowFilter] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [deletePatientId, setDeletePatientId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();

  const { data: response, isLoading } = useQuery({
    queryKey: ['patients', searchTerm, page, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit: 10,
        sortBy,
        sortOrder
      });
      if (searchTerm) params.append('search', searchTerm);
      
      const { data } = await api.get(`/patients?${params.toString()}`);
      return data; // Returns { patients, pagination }
    }
  });

  const patients = response?.patients || [];
  const pagination = response?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />;
  };

  const addMutation = useMutation({
    mutationFn: (newPatient) => api.post('/patients', newPatient),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient added successfully!');
      setIsAddModalOpen(false);
      reset();
    },
    onError: () => toast.error('Failed to add patient')
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/patients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient updated successfully!');
      setEditPatient(null);
    },
    onError: () => toast.error('Failed to update patient')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient deleted successfully!');
      setDeletePatientId(null);
    },
    onError: () => toast.error('Failed to delete patient')
  });

  const onSubmitAdd = (data) => {
    const address = data.detailAddress ? `${data.padukuhan}, ${data.detailAddress}` : data.padukuhan;
    const submitData = { ...data, address, age: parseInt(data.age) };
    delete submitData.padukuhan;
    delete submitData.detailAddress;
    addMutation.mutate(submitData);
  };

  const onSubmitEdit = (data) => {
    const address = data.detailAddress ? `${data.padukuhan}, ${data.detailAddress}` : data.padukuhan;
    const submitData = { ...data, address, age: parseInt(data.age) };
    delete submitData.padukuhan;
    delete submitData.detailAddress;
    editMutation.mutate({ id: editPatient.id, data: submitData });
  };

  const openEditModal = (patient) => {
    setEditPatient(patient);
    let matchedPadukuhan = '';
    let detailAddress = patient.address;

    for (const p of PADUKUHAN_LIST) {
      if (patient.address.toLowerCase().includes(p.toLowerCase())) {
        matchedPadukuhan = p;
        // Strip out the padukuhan name from the detail address for cleaner editing
        detailAddress = patient.address.replace(new RegExp(`^${p}[,\\s]*`, 'i'), '').trim();
        break;
      }
    }

    resetEdit({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      padukuhan: matchedPadukuhan,
      detailAddress: detailAddress,
      phone: patient.phone || ''
    });
  };

  const genderOptions = [
    { value: 'MALE', label: 'Laki-laki' },
    { value: 'FEMALE', label: 'Perempuan' }
  ];

  const padukuhanOptions = [
    { value: '', label: 'Pilih Padukuhan...' },
    ...PADUKUHAN_LIST.map(p => ({ value: p, label: p }))
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Direktori Pasien</h1>
          <p className="text-[13px] text-slate-500 mt-1">Kelola dan pantau pasien yang terdaftar.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-rose-600 text-white text-[13px] font-medium rounded-lg hover:bg-rose-700 transition-colors shadow-sm outline-none"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Pasien
        </button>
      </div>

      <div className="bg-white rounded-[20px] shadow-soft border border-slate-100/50 overflow-hidden flex flex-col h-[calc(100vh-12rem)] relative">
        <div className="p-5 border-b border-slate-100/50 flex flex-col sm:flex-row gap-4 justify-between bg-white shrink-0 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID, Nama..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-[13px] border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-colors bg-slate-50/50 placeholder:text-slate-400"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center px-3 py-2 border text-[13px] font-medium rounded-lg transition-colors outline-none ${showFilter ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter className={`w-4 h-4 mr-2 ${showFilter ? 'text-rose-500' : 'text-slate-400'}`} />
              Urut & Filter
            </button>
            <AnimatePresence>
              {showFilter && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-xl z-20 p-2"
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Urut Berdasarkan</div>
                  <button onClick={() => {handleSort('name'); setShowFilter(false)}} className="w-full text-left px-2 py-1.5 text-[13px] hover:bg-slate-50 rounded-md text-slate-700">Nama</button>
                  <button onClick={() => {handleSort('age'); setShowFilter(false)}} className="w-full text-left px-2 py-1.5 text-[13px] hover:bg-slate-50 rounded-md text-slate-700">Umur</button>
                  <button onClick={() => {handleSort('createdAt'); setShowFilter(false)}} className="w-full text-left px-2 py-1.5 text-[13px] hover:bg-slate-50 rounded-md text-slate-700">Tanggal Daftar</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar px-1">
          <table className="w-full text-left border-collapse whitespace-nowrap relative">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100/80">
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('name')}>
                  Nama & Kontak <SortIcon field="name" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('id')}>
                  ID (NIK) <SortIcon field="id" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('age')}>
                  Umur & J.Kelamin <SortIcon field="age" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('address')}>
                  Alamat <SortIcon field="address" />
                </th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse bg-white">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-400 text-[13px] font-medium">Tidak ada pasien ditemukan.</td></tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group bg-white">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-[11px]">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-[13px] group-hover:text-rose-600 transition-colors">{patient.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{patient.phone || 'Tanpa telepon'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[12px]">{patient.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-[13px] text-slate-600">
                      <span className="font-medium text-slate-700">{patient.age}</span> thn • <span className="capitalize">{patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-500 truncate max-w-xs">{patient.address}</td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button 
                        onClick={() => openEditModal(patient)}
                        className="inline-flex items-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors outline-none"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletePatientId(patient.id)}
                        className="inline-flex items-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors outline-none"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`${basePath}/patients/${patient.id}`}
                        className="inline-flex items-center p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors outline-none"
                        title="View Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100/50 flex items-center justify-between bg-white shrink-0">
          <span className="text-[12px] font-medium text-slate-500">
            Menampilkan {patients.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} hingga {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} entri
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors flex items-center outline-none"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Sebel
            </button>
            <button 
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages || pagination.totalPages === 0}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors flex items-center outline-none"
            >
              Lanjut <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Daftarkan Pasien">
        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-5">
          <Input label="Nama Lengkap" {...register("name", { required: true })} placeholder="Budi Santoso" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Umur" type="number" {...register("age", { required: true })} placeholder="Misal: 45" />
            <Select label="Jenis Kelamin" options={genderOptions} {...register("gender", { required: true })} />
          </div>
          <Input label="Nomor Telepon" {...register("phone")} placeholder="Opsional" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Padukuhan" options={padukuhanOptions} {...register("padukuhan", { required: true })} />
            <Input label="Detail Alamat" {...register("detailAddress")} placeholder="RT/RW, Jalan (Opsional)" />
          </div>
          <div className="flex justify-end pt-5 mt-2 border-t border-slate-100">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg mr-2 transition-colors">Batal</button>
            <button type="submit" disabled={addMutation.isPending} className="px-5 py-2.5 text-[13px] font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm focus:ring-2 focus:ring-rose-500/20 outline-none">
              {addMutation.isPending ? 'Menyimpan...' : 'Simpan Pasien'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editPatient} onClose={() => setEditPatient(null)} title="Perbarui Pasien">
        <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-5">
          <Input label="Nama Lengkap" {...registerEdit("name", { required: true })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Umur" type="number" {...registerEdit("age", { required: true })} />
            <Select label="Jenis Kelamin" options={genderOptions} {...registerEdit("gender", { required: true })} />
          </div>
          <Input label="Nomor Telepon" {...registerEdit("phone")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Padukuhan" options={padukuhanOptions} {...registerEdit("padukuhan", { required: true })} />
            <Input label="Detail Alamat" {...registerEdit("detailAddress")} placeholder="RT/RW, Jalan (Opsional)" />
          </div>
          <div className="flex justify-end pt-5 mt-2 border-t border-slate-100">
            <button type="button" onClick={() => setEditPatient(null)} className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg mr-2 transition-colors">Batal</button>
            <button type="submit" disabled={editMutation.isPending} className="px-5 py-2.5 text-[13px] font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm focus:ring-2 focus:ring-rose-500/20 outline-none">
              {editMutation.isPending ? 'Memperbarui...' : 'Perbarui Detail'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletePatientId} onClose={() => setDeletePatientId(null)} title="Konfirmasi Penghapusan">
        <div className="space-y-5">
          <p className="text-[13px] text-slate-600 leading-relaxed">Apakah Anda yakin ingin menghapus pasien ini secara permanen? Semua rekam medis yang terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end pt-5 border-t border-slate-100">
            <button onClick={() => setDeletePatientId(null)} className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg mr-2 transition-colors">
              Batal
            </button>
            <button 
              onClick={() => deleteMutation.mutate(deletePatientId)} 
              disabled={deleteMutation.isPending}
              className="px-5 py-2.5 text-[13px] font-medium bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-rose-500/20 outline-none"
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Permanen'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Patients;
