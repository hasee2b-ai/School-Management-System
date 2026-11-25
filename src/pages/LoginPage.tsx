import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { User } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Input } from '../components/common/Input.tsx';
import { getLockRemainingMs, DEMO_PASSWORD } from '../services/authService.ts';
import { Shield, Sparkles } from 'lucide-react';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const GENERIC_ERROR = 'Invalid email or password';

const throttleMessage = (ms: number) =>
  `Too many failed attempts. Try again in ${Math.max(1, Math.ceil(ms / 1000))} seconds.`;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { availableUsers, loginAs, login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const remainingBefore = getLockRemainingMs(email);
    if (remainingBefore > 0) {
      setError(throttleMessage(remainingBefore));
      return;
    }

    setError('');
    const signedIn = await login(email, password);
    if (signedIn) {
      navigate('/');
      return;
    }

    const remainingAfter = getLockRemainingMs(email);
    setError(remainingAfter > 0 ? throttleMessage(remainingAfter) : GENERIC_ERROR);
  };

  const handleQuickLogin = (user: User) => {
    loginAs(user);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#090b0f] light:bg-[#f8fafc] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Soft Ambient Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 light:text-slate-900">
            School Management Console
          </h1>
          <p className="text-xs text-slate-400 light:text-slate-600">
            Enterprise Education Administration, Academics & Operations Platform
          </p>
        </div>

        {/* Glass Authentication Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800/80 light:border-slate-300 light:bg-white shadow-2xl">
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <Input
              label="Academic Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="name@staugustine.edu"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 light:text-slate-700">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      DEMO_MODE
                        ? `Demo mode: seeded accounts use ${DEMO_PASSWORD} or a 1-click role below.`
                        : 'This is a client-side demo. Contact your administrator for access.',
                    );
                  }}
                  className="text-[11px] text-indigo-400 light:text-indigo-600 hover:underline"
                >
                  Forgot access key?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="block w-full rounded-lg bg-slate-900/80 light:bg-white text-slate-100 light:text-slate-900 border border-slate-800 light:border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <Button type="submit" className="w-full mt-2" size="lg">
              Sign In to Console
            </Button>
            {error && (
              <p role="alert" className="text-xs font-medium text-red-400 light:text-red-600">
                {error}
              </p>
            )}
          </form>

          <p className="mt-3 text-center text-[11px] text-slate-400 light:text-slate-600">
            Simulated client-side sign-in{DEMO_MODE ? ` · demo password: ${DEMO_PASSWORD}` : ''}.
          </p>

          {/* Quick demo accounts - only when VITE_DEMO_MODE=true */}
          {DEMO_MODE && (
            <div className="mt-8 pt-6 border-t border-slate-800/80 light:border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 light:text-indigo-600" />
                  Demo mode · 1-Click Role Access
                </span>
                <span className="text-[10px] text-slate-400 light:text-slate-600 font-mono">Select persona</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-800/80 hover:border-indigo-500/50 light:bg-slate-50 light:hover:bg-indigo-50/70 light:border-slate-200 text-left transition-all duration-150 group"
                  >
                    <p className="text-xs font-bold text-slate-200 light:text-slate-900 group-hover:text-indigo-300 light:group-hover:text-indigo-700 capitalize truncate">
                      {user.role.replace('_', ' ')}
                    </p>
                    <p className="text-[10px] text-slate-400 light:text-slate-600 truncate mt-0.5">
                      {user.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 light:text-slate-600 font-mono">
          St. Augustine Academy · Multi-Role School Management System v2026.4
        </p>
      </div>
    </div>
  );
};
