import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-slate-300 light:text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`block w-full rounded-lg bg-slate-900/80 light:bg-white text-slate-100 light:text-slate-900 border transition-all duration-150 sm:text-sm px-3.5 py-2 ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-slate-800 light:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="mt-1.5 text-xs text-rose-400 light:text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-400 light:text-slate-600">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
