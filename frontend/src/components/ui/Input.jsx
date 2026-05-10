import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        {...props}
        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-[13px] bg-white hover:bg-slate-50 transition-all duration-200 outline-none ${
          error ? 'border-rose-500' : 'border-slate-200'
        }`}
      />
      {error && <p className="mt-1.5 text-[12px] font-medium text-rose-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
