import Modal from '../ui/Modal';

const DeleteRecordModal = ({ recordId, onClose, onDelete, isPending }) => {
  return (
    <Modal isOpen={!!recordId} onClose={onClose} title="Hapus Log">
      <div className="space-y-5">
        <p className="text-[13px] text-slate-600 leading-relaxed">
          Apakah Anda yakin ingin menghapus rekam medis ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end pt-5 border-t border-slate-100">
          <button 
            onClick={onClose} 
            className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg mr-2 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => onDelete(recordId)} 
            disabled={isPending}
            className="px-5 py-2.5 text-[13px] font-medium bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors shadow-sm outline-none"
          >
            {isPending ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteRecordModal;
