import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext.tsx';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Check,
  CheckCheck,
  Calendar,
  LogOut,
} from 'lucide-react';
import { Role } from '../../types/index.ts';

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
  title?: string;
  sidebarOpen?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  onOpenCommandPalette,
  title = 'Dashboard',
  sidebarOpen = false,
}) => {
  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme,
    academicYear,
    setAcademicYear,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: { role: Role; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Full system privileges' },
    { role: 'admin', label: 'School Admin', desc: 'Operations & admissions' },
    { role: 'principal', label: 'Principal', desc: 'Academic leadership & oversight' },
    { role: 'teacher', label: 'Teacher', desc: 'Grading, attendance & syllabus' },
    { role: 'student', label: 'Student', desc: 'Timetable, assignments & exams' },
    { role: 'parent', label: 'Parent', desc: 'Child reports & fee payments' },
    { role: 'accountant', label: 'Accountant', desc: 'Billing, receipts & ledgers' },
    { role: 'librarian', label: 'Librarian', desc: 'Catalog & book loans' },
    { role: 'transport_manager', label: 'Transport Mgr', desc: 'Bus routes & fleet dispatch' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/80 light:border-slate-300 light:bg-white/95 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left zone: Sidebar toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`${sidebarOpen ? 'lg:hidden' : ''} p-2 -ml-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100 transition-colors cursor-pointer`}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 light:text-slate-900 truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Center/Right zone: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Academic Year Selector */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-xs text-slate-300 light:text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400 light:text-slate-600" />
          <span className="font-mono">{academicYear}</span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="sr-only"
            aria-label="Academic Year"
          >
            <option value="2026-2027">2026-2027</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>

        {/* Global Search / Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 light:bg-slate-100 light:hover:bg-slate-200 border border-slate-800 light:border-slate-300 text-xs text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900 transition-colors"
          title="Search console (⌘K / Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search console...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 light:bg-slate-200 text-slate-400 light:text-slate-700 rounded border border-slate-700 light:border-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Center */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl glass-dropdown border border-slate-700/80 light:border-slate-300 light:bg-white shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 light:border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 light:text-slate-900">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-indigo-600/30 light:bg-indigo-100 text-indigo-400 light:text-indigo-700 font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-[11px] text-slate-400 light:text-slate-600 hover:text-indigo-400 light:hover:text-indigo-600 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50 light:divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 light:text-slate-600">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markNotificationRead(item.id)}
                      className={`p-3.5 hover:bg-slate-800/50 light:hover:bg-slate-50 cursor-pointer transition-colors ${
                        !item.read ? 'bg-indigo-950/20 light:bg-indigo-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-200 light:text-slate-900">
                          {item.title}
                        </p>
                        <span className="text-[10px] text-slate-400 light:text-slate-600 font-mono shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 light:text-slate-600 line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Menu */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setRoleMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2 py-1.5 bg-transparent text-slate-100 light:text-slate-900 text-xs font-semibold cursor-pointer"
            aria-label="Switch demo role"
          >
            <span className="hidden md:inline font-mono capitalize">
              {currentRole.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl glass-dropdown border border-slate-700/80 light:border-slate-300 light:bg-white shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-800 light:border-slate-200">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
                  Switch Role (Live Demo)
                </p>
                <p className="text-[11px] text-slate-400 light:text-slate-600 mt-0.5">
                  Logged in as <strong className="text-slate-200 light:text-slate-900">{currentUser.name}</strong>
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto py-1">
                {rolesList.map((item) => {
                  const isSelected = currentRole === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchRole(item.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors ${
                        isSelected ? 'bg-indigo-600/10 text-indigo-300 light:bg-indigo-50 light:text-indigo-700' : 'text-slate-300 light:text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="text-[10px] text-slate-400 light:text-slate-600">{item.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400 light:text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="px-2 pt-2 border-t border-slate-800 light:border-slate-200">
                <button
                  onClick={() => {
                    logout();
                    setRoleMenuOpen(false);
                    navigate('/login', { replace: true });
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-xs font-semibold text-red-400 light:text-red-600 hover:bg-red-500/10 light:hover:bg-red-50 transition-colors rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
