import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Role } from '../../types/index.ts';

interface AccessDeniedProps {
  role?: Role;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ role }) => (
  <div className="flex items-center justify-center p-6 sm:p-10">
    <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-800/80 light:border-slate-300 light:bg-white p-8 text-center space-y-4 shadow-2xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 light:text-red-600">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div className="space-y-2">
        <h1 className="text-lg font-bold text-slate-100 light:text-slate-900">Access denied</h1>
        <p className="text-sm text-slate-400 light:text-slate-600">
          You don't have permission to view this page.
        </p>
        <p className="text-xs text-slate-400 light:text-slate-600">
          Your current role:{' '}
          <strong className="font-mono text-slate-200 light:text-slate-900">{role ?? 'unknown'}</strong>
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  </div>
);
