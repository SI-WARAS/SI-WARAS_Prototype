import { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-[13px] bg-white hover:bg-slate-50 transition-all duration-200 outline-none ${
          error ? 'border-rose-500' : 'border-slate-200'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-[12px] font-medium text-rose-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
