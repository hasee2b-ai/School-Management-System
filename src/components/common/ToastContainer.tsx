import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 light:text-emerald-600 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 light:text-amber-600 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 light:text-rose-600 shrink-0" />,
          info: <Info className="w-4 h-4 text-indigo-400 light:text-indigo-600 shrink-0" />,
        }[toast.type];

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg glass-dropdown border border-slate-700/80 light:border-slate-300 light:bg-white shadow-xl animate-in slide-in-from-bottom-2 fade-in duration-200"
          >
            <div className="mt-0.5">{icons}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-100 light:text-slate-900 truncate">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-0.5 text-xs text-slate-400 light:text-slate-600 line-clamp-2">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900 p-0.5 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
