import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-700 hover:translate-y-[-1px]' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400 light:text-slate-600 uppercase tracking-wider">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-100 light:text-slate-900 font-mono tabular-nums">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 light:bg-indigo-50 light:text-indigo-600 light:border-indigo-100 shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/60 light:border-slate-200 flex items-center justify-between gap-2 text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`font-semibold font-mono ${
                  trend.isPositive ? 'text-emerald-400 light:text-emerald-700' : 'text-rose-400 light:text-rose-700'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              {trend.label && (
                <span className="text-slate-400 light:text-slate-600 hidden sm:inline">{trend.label}</span>
              )}
            </div>
          ) : <div />}
          {subtitle && (
            <span className="text-slate-400 light:text-slate-600 truncate text-right text-[11px]">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};
