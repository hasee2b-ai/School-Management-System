import React from 'react';
import { Button } from './Button.tsx';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-800 light:border-slate-300 bg-slate-900/30 light:bg-slate-50/50 ${className}`}
    >
      {icon && (
        <div className="p-3.5 mb-3 rounded-xl bg-slate-800/80 light:bg-slate-200/80 text-slate-400 light:text-slate-600">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-200 light:text-slate-900">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-400 light:text-slate-600 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
