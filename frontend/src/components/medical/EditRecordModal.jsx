import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { format } from 'date-fns';

const EditRecordModal = ({ record, onClose, onEdit, isPending }) => {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (record) {
      reset({
        date: format(new Date(record.date), "yyyy-MM-dd'T'HH:mm"),
        bloodPressure: record.bloodPressure,
        bloodSugar: record.bloodSugar,
        cholesterol: record.cholesterol,
        uricAcid: record.uricAcid,
        weight: record.weight,
        height: record.height,
        activityLevel: record.activityLevel,
        smokingStatus: record.smokingStatus ? 'true' : 'false',
        notes: record.notes || ''
      });
    }
  }, [record, reset]);

  const onSubmit = (data) => {
    onEdit(record.id, data);
  };

  const activityOptions = [
    { value: 'LOW', label: 'Rendah' },
    { value: 'MODERATE', label: 'Sedang' },
    { value: 'HIGH', label: 'Tinggi' },
  ];

  const smokingOptions = [
    { value: 'false', label: 'Tidak' },
    { value: 'true', label: 'Ya' },
  ];

  return (
    <Modal isOpen={!!record} onClose={onClose} title="Perbarui Data Medis">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            className="col-span-2"
            label="Tanggal" 
            type="datetime-local" 
            {...register("date", { required: true })} 
          />
          <Input 
            label="Tekanan Darah" 
            {...register("bloodPressure", { required: true })} 
          />
          <Input 
            label="Gula Darah" 
            type="number" 
            step="0.1" 
            {...register("bloodSugar", { required: true })} 
          />
          <Input 
            label="Kolesterol" 
            type="number" 
            step="0.1" 
            {...register("cholesterol", { required: true })} 
          />
          <Input 
            label="Asam Urat" 
            type="number" 
            step="0.1" 
            {...register("uricAcid", { required: true })} 
          />
          <Select 
            label="Tingkat Aktivitas" 
            options={activityOptions} 
            {...register("activityLevel", { required: true })} 
          />
          <Input 
            label="Berat (kg)" 
            type="number" 
            step="0.1" 
            {...register("weight", { required: true })} 
          />
          <Input 
            label="Tinggi (cm)" 
            type="number" 
            step="0.1" 
            {...register("height", { required: true })} 
          />
          <Select 
            label="Status Merokok" 
            options={smokingOptions} 
            {...register("smokingStatus", { required: true })} 
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Catatan Klinis</label>
          <textarea 
            {...register("notes")} 
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-[13px] bg-white hover:bg-slate-50 transition-all duration-200 outline-none" 
            rows="3"
          />
        </div>
        <div className="flex justify-end pt-5 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg mr-2 transition-colors">Batal</button>
          <button type="submit" disabled={isPending} className="px-5 py-2.5 text-[13px] font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm outline-none">
            {isPending ? 'Memperbarui...' : 'Perbarui Log'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditRecordModal;
