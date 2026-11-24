import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-slate-300 light:text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`block w-full rounded-lg bg-slate-900/80 light:bg-white text-slate-100 light:text-slate-900 placeholder:text-slate-500 border transition-all duration-150 sm:text-sm ${
              icon ? 'pl-9' : 'pl-3.5'
            } pr-3.5 py-2 ${
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-800 light:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-rose-400 light:text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-400 light:text-slate-600">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
