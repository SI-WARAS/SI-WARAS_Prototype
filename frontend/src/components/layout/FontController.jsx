import { useFontScale } from '../../context/FontScaleContext';
import { Plus, Minus, RotateCcw } from 'lucide-react';

const FontController = () => {
  const { scale, incrementFont, decrementFont, resetFont } = useFontScale();

  return (
    <div className="flex items-center bg-[#F8F9FB] border border-slate-100 p-1 rounded-xl shadow-sm gap-1">
      <button
        type="button"
        onClick={decrementFont}
        title="Perkecil Ukuran Teks"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white hover:shadow-sm transition-all outline-none cursor-pointer"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      
      <span className="text-[11px] font-bold text-slate-500 min-w-[38px] text-center select-none bg-white py-0.5 px-1 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {Math.round(scale * 100)}%
      </span>

      <button
        type="button"
        onClick={incrementFont}
        title="Perbesar Ukuran Teks"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white hover:shadow-sm transition-all outline-none cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-slate-200 mx-0.5"></div>

      <button
        type="button"
        onClick={resetFont}
        title="Reset Ukuran"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm transition-all outline-none cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
      </button>
    </div>
  );
};

export default FontController;
