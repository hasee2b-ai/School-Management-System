import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }[size];

  const variantStyles: Record<BadgeVariant, { bg: string; dotColor: string }> = {
    default: {
      bg: 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 light:bg-indigo-50 light:text-indigo-700 light:border-indigo-200',
      dotColor: 'bg-indigo-400',
    },
    success: {
      bg: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200',
      dotColor: 'bg-emerald-400',
    },
    warning: {
      bg: 'bg-amber-950/60 text-amber-300 border border-amber-800/60 light:bg-amber-50 light:text-amber-700 light:border-amber-200',
      dotColor: 'bg-amber-400',
    },
    danger: {
      bg: 'bg-rose-950/60 text-rose-300 border border-rose-800/60 light:bg-rose-50 light:text-rose-700 light:border-rose-200',
      dotColor: 'bg-rose-400',
    },
    info: {
      bg: 'bg-sky-950/60 text-sky-300 border border-sky-800/60 light:bg-sky-50 light:text-sky-700 light:border-sky-200',
      dotColor: 'bg-sky-400',
    },
    neutral: {
      bg: 'bg-slate-800/80 text-slate-300 border border-slate-700/80 light:bg-slate-100 light:text-slate-700 light:border-slate-200',
      dotColor: 'bg-slate-400',
    },
  };

  const current = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md whitespace-nowrap shrink-0 ${sizeStyles} ${current.bg} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor} shrink-0`} />}
      {children}
    </span>
  );
};
