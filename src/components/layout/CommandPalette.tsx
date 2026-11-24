import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext.tsx';
import {
  Search,
  LayoutDashboard,
  GraduationCap,
  Users,
  Layers,
  CalendarCheck2,
  Receipt,
  BookOpen,
  Award,
  Bus,
  Library,
  Settings,
  Sun,
  UserCheck,
  X,
} from 'lucide-react';
import { Role } from '../../types/index.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const { students, teachers, toggleTheme } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navCommands = [
    { label: 'Go to Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, action: () => navigate('/') },
    { label: 'Go to Students Management', icon: <GraduationCap className="w-4 h-4" />, action: () => navigate('/students') },
    { label: 'Go to Teachers & Staff Directory', icon: <Users className="w-4 h-4" />, action: () => navigate('/teachers') },
    { label: 'Go to Classes & Sections', icon: <Layers className="w-4 h-4" />, action: () => navigate('/classes') },
    { label: 'Go to Mark Attendance', icon: <CalendarCheck2 className="w-4 h-4" />, action: () => navigate('/attendance') },
    { label: 'Go to Fees & Ledger', icon: <Receipt className="w-4 h-4" />, action: () => navigate('/fees') },
    { label: 'Go to Exam Schedules & Results', icon: <Award className="w-4 h-4" />, action: () => navigate('/exams') },
    { label: 'Go to Library Catalog', icon: <Library className="w-4 h-4" />, action: () => navigate('/library') },
    { label: 'Go to Transport Routes', icon: <Bus className="w-4 h-4" />, action: () => navigate('/transport') },
    { label: 'Go to System Administration', icon: <Settings className="w-4 h-4" />, action: () => navigate('/settings') },
  ];

  const roleCommands: { label: string; role: Role }[] = [
    { label: 'Switch to Super Admin View', role: 'super_admin' },
    { label: 'Switch to Principal View', role: 'principal' },
    { label: 'Switch to Teacher View', role: 'teacher' },
    { label: 'Switch to Student View', role: 'student' },
    { label: 'Switch to Parent View', role: 'parent' },
    { label: 'Switch to Accountant View', role: 'accountant' },
  ];

  const matchedStudents = query
    ? students.filter(
        (s) =>
          s.firstName.toLowerCase().includes(query.toLowerCase()) ||
          s.lastName.toLowerCase().includes(query.toLowerCase()) ||
          s.admissionNumber.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchedTeachers = query
    ? teachers.filter(
        (t) =>
          t.firstName.toLowerCase().includes(query.toLowerCase()) ||
          t.lastName.toLowerCase().includes(query.toLowerCase()) ||
          t.employeeId.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchedNav = navCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const executeAction = (cb: () => void) => {
    cb();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-xl rounded-xl glass-dropdown border border-slate-700/80 light:border-slate-300 light:bg-white shadow-2xl overflow-hidden transition-all">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-slate-800 light:border-slate-200">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, student name, or page..."
            className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200 light:hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          <div>
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
              Quick Actions
            </p>
            <div className="mt-1 space-y-0.5">
              <button
                onClick={() =>
                  executeAction(() => {
                    toggleTheme();
                  })
                }
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs text-slate-200 light:text-slate-800 hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors"
              >
                <Sun className="w-4 h-4 text-amber-400 light:text-amber-600" />
                <span>Toggle Dark / Light Mode</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          {matchedNav.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
                Navigation
              </p>
              <div className="mt-1 space-y-0.5">
                {matchedNav.slice(0, 5).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => executeAction(item.action)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs text-slate-200 light:text-slate-800 hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-slate-400 light:text-slate-600">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student Matches */}
          {matchedStudents.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
                Students
              </p>
              <div className="mt-1 space-y-0.5">
                {matchedStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      executeAction(() => {
                        navigate('/students');
                      })
                    }
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs text-slate-200 light:text-slate-800 hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-indigo-400 light:text-indigo-600" />
                      <span>{s.firstName} {s.lastName}</span>
                      <span className="text-[11px] text-slate-400 light:text-slate-600 font-mono">({s.admissionNumber})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 light:text-slate-600">{s.rollNumber}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teacher Matches */}
          {matchedTeachers.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
                Staff & Teachers
              </p>
              <div className="mt-1 space-y-0.5">
                {matchedTeachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      executeAction(() => {
                        navigate('/teachers');
                      })
                    }
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs text-slate-200 light:text-slate-800 hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-emerald-400 light:text-emerald-600" />
                      <span>{t.firstName} {t.lastName}</span>
                      <span className="text-[11px] text-slate-400 light:text-slate-600">({t.roleTitle})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 light:text-slate-600 font-mono">{t.employeeId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Role Switching */}
          <div>
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
              Switch Experience (Demo)
            </p>
            <div className="mt-1 space-y-0.5">
              {roleCommands.map((rc, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    executeAction(() => {
                      switchRole(rc.role);
                    })
                  }
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs text-slate-200 light:text-slate-800 hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-indigo-400 light:text-indigo-600" />
                  <span>{rc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-2 bg-slate-900/60 light:bg-slate-100 border-t border-slate-800 light:border-slate-200 flex items-center justify-between text-[11px] text-slate-400 light:text-slate-600">
          <span>Navigate with arrow keys or click</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 rounded">ESC to close</kbd>
        </div>
      </div>
    </div>
  );
};
