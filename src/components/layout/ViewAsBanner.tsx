import React from 'react';
import { Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export const ViewAsBanner: React.FC = () => {
  const { isViewingAs, viewAsRole, actualUser, exitViewAs } = useAuth();

  if (!isViewingAs) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 text-[11px] sm:text-xs text-amber-300 light:text-amber-800 light:bg-amber-50 light:border-amber-300">
      <Eye className="w-3.5 h-3.5 shrink-0" />
      <span>
        Viewing as <strong className="font-semibold capitalize">{viewAsRole?.replace('_', ' ')}</strong>
        {' — '}you are signed in as <strong className="font-semibold">{actualUser.name}</strong>
      </span>
      <button
        type="button"
        onClick={exitViewAs}
        className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 px-2 py-1 font-semibold hover:bg-amber-500/20 light:hover:bg-amber-100 transition-colors"
      >
        <X className="w-3 h-3" />
        Exit view
      </button>
    </div>
  );
};
