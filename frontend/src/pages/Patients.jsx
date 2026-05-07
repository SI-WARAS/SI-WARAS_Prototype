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

const Patients = () => {
  const { user } = useAuth();
  
  const getBasePath = (role) => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'HEALTH_WORKER') return '/petugas';
    if (role === 'VILLAGE_HEAD') return '/kepala-desa';
    return '';
  };
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

  const onSubmitAdd = (data) => addMutation.mutate({ ...data, age: parseInt(data.age) });
  const onSubmitEdit = (data) => editMutation.mutate({ id: editPatient.id, data: { ...data, age: parseInt(data.age) } });

  const openEditModal = (patient) => {
    setEditPatient(patient);
    resetEdit({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
      phone: patient.phone || ''
    });
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-[13px] bg-white hover:bg-slate-50 transition-all duration-200 outline-none";
  const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Patients Directory</h1>
          <p className="text-[13px] text-slate-500 mt-1">Manage and monitor registered patients.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-rose-600 text-white text-[13px] font-medium rounded-lg hover:bg-rose-700 transition-colors shadow-sm outline-none"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Patient
        </button>
      </div>

      <div className="bg-white rounded-[20px] shadow-soft border border-slate-100/50 overflow-hidden flex flex-col h-[calc(100vh-12rem)] relative">
        <div className="p-5 border-b border-slate-100/50 flex flex-col sm:flex-row gap-4 justify-between bg-white shrink-0 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Name..."
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
              Sort & Filter
            </button>
            <AnimatePresence>
              {showFilter && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-xl z-20 p-2"
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Sort By</div>
                  <button onClick={() => {handleSort('name'); setShowFilter(false)}} className="w-full text-left px-2 py-1.5 text-[13px] hover:bg-slate-50 rounded-md text-slate-700">Name</button>
                  <button onClick={() => {handleSort('age'); setShowFilter(false)}} className="w-full text-left px-2 py-1.5 text-[13px] hover:bg-slate-50 rounded-md text-slate-700">Age</button>
                  <button onClick={() => {handleSort('createdAt'); setShowFilter(false)}} className="w-full text-left px-2 py-1.5 text-[13px] hover:bg-slate-50 rounded-md text-slate-700">Registration Date</button>
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
                  Name & Contact <SortIcon field="name" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('id')}>
                  ID (NIK) <SortIcon field="id" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('age')}>
                  Age & Gender <SortIcon field="age" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('address')}>
                  Address <SortIcon field="address" />
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                <tr><td colSpan="5" className="p-12 text-center text-slate-400 text-[13px] font-medium">No patients found.</td></tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group bg-white">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-[11px]">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-[13px] group-hover:text-rose-600 transition-colors">{patient.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{patient.phone || 'No phone'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[12px]">{patient.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-[13px] text-slate-600">
                      <span className="font-medium text-slate-700">{patient.age}</span> yrs • <span className="capitalize">{patient.gender.toLowerCase()}</span>
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
            Showing {patients.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors flex items-center outline-none"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </button>
            <button 
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages || pagination.totalPages === 0}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors flex items-center outline-none"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Patient">
        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-5">
          <div>
            <label className={labelClass}>Full Name</label>
            <input {...register("name", { required: true })} className={inputClass} placeholder="John Doe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Age</label>
              <input type="number" {...register("age", { required: true })} className={inputClass} placeholder="e.g. 45" />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select {...register("gender", { required: true })} className={inputClass}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input {...register("phone")} className={inputClass} placeholder="Optional" />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <textarea {...register("address", { required: true })} className={inputClass} rows="3" placeholder="Full address"></textarea>
          </div>
          <div className="flex justify-end pt-5 mt-2 border-t border-slate-100">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg mr-2 transition-colors">Cancel</button>
            <button type="submit" disabled={addMutation.isPending} className="px-5 py-2.5 text-[13px] font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm focus:ring-2 focus:ring-rose-500/20 outline-none">
              {addMutation.isPending ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editPatient} onClose={() => setEditPatient(null)} title="Update Patient">
        <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-5">
          <div>
            <label className={labelClass}>Full Name</label>
            <input {...registerEdit("name", { required: true })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Age</label>
              <input type="number" {...registerEdit("age", { required: true })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select {...registerEdit("gender", { required: true })} className={inputClass}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input {...registerEdit("phone")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <textarea {...registerEdit("address", { required: true })} className={inputClass} rows="3"></textarea>
          </div>
          <div className="flex justify-end pt-5 mt-2 border-t border-slate-100">
            <button type="button" onClick={() => setEditPatient(null)} className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg mr-2 transition-colors">Cancel</button>
            <button type="submit" disabled={editMutation.isPending} className="px-5 py-2.5 text-[13px] font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm focus:ring-2 focus:ring-rose-500/20 outline-none">
              {editMutation.isPending ? 'Updating...' : 'Update Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletePatientId} onClose={() => setDeletePatientId(null)} title="Delete Confirmation">
        <div className="space-y-5">
          <p className="text-[13px] text-slate-600 leading-relaxed">Are you sure you want to permanently delete this patient? All associated medical records will also be erased. This action cannot be undone.</p>
          <div className="flex justify-end pt-5 border-t border-slate-100">
            <button onClick={() => setDeletePatientId(null)} className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg mr-2 transition-colors">
              Cancel
            </button>
            <button 
              onClick={() => deleteMutation.mutate(deletePatientId)} 
              disabled={deleteMutation.isPending}
              className="px-5 py-2.5 text-[13px] font-medium bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-rose-500/20 outline-none"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Patients;
