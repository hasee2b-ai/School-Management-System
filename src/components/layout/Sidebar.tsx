import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { ROUTE_ACCESS } from '../../config/access.ts';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  CalendarCheck2,
  Clock,
  Award,
  FileSpreadsheet,
  Receipt,
  Library,
  Bus,
  Megaphone,
  BarChart3,
  Settings,
  Shield,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentRole, currentUser } = useAuth();
  const { assignments, invoices, announcements } = useApp();

  const pendingInvoices = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').length;
  const activeAssignments = assignments.length;
  const pinnedNotices = announcements.filter((a) => a.pinned).length;

  const navItems: NavItemConfig[] = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/students',
      label: 'Students',
      icon: <GraduationCap className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/teachers',
      label: 'Teachers & Staff',
      icon: <Users className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/classes',
      label: 'Classes & Sections',
      icon: <Layers className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/subjects',
      label: 'Subjects',
      icon: <BookOpen className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/attendance',
      label: 'Attendance',
      icon: <CalendarCheck2 className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/timetable',
      label: 'Timetable',
      icon: <Clock className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/exams',
      label: 'Exams & Results',
      icon: <Award className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/assignments',
      label: 'Assignments',
      icon: <FileSpreadsheet className="w-5 h-5 shrink-0" />,
      badge: activeAssignments > 0 ? activeAssignments : undefined,
    },
    {
      to: '/fees',
      label: 'Fees & Finance',
      icon: <Receipt className="w-5 h-5 shrink-0" />,
      badge: pendingInvoices > 0 ? pendingInvoices : undefined,
    },
    {
      to: '/library',
      label: 'Library',
      icon: <Library className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/transport',
      label: 'Transport',
      icon: <Bus className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/communication',
      label: 'Notices & Board',
      icon: <Megaphone className="w-5 h-5 shrink-0" />,
      badge: pinnedNotices > 0 ? pinnedNotices : undefined,
    },
    {
      to: '/reports',
      label: 'Reports & Analytics',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/settings',
      label: 'Administration',
      icon: <Settings className="w-5 h-5 shrink-0" />,
    },
  ];

  const visibleItems = navItems.filter((item) => ROUTE_ACCESS[item.to]?.includes(currentRole));

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNavLinkClick = () => {
    // Auto-close on smaller mobile screens when navigation link is clicked
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile & tablet overlays with smooth fade transition */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Main sliding sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 glass-panel border-r border-slate-800/80 light:border-slate-300 light:bg-slate-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main Navigation"
      >
        {/* Top Brand zone */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 light:border-slate-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0 overflow-hidden whitespace-nowrap">
              <span className="text-sm font-bold tracking-tight text-slate-100 light:text-slate-900 block truncate">
                School Console
              </span>
              <span className="text-[10px] text-indigo-400 light:text-indigo-600 font-medium block truncate tracking-wide uppercase">
                Enterprise Suite
              </span>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            {/* Plain "Close" text button only */}
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-950 transition-colors duration-200 cursor-pointer bg-transparent border-0 px-2 py-1.5 hover:underline focus:outline-none select-none active:text-indigo-400"
              aria-label="Close sidebar"
            >
              Close
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 light:bg-indigo-50 light:text-indigo-700 light:border-indigo-200'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100'
                }`
              }
            >
              {item.icon}
              <span className="truncate flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono tabular-nums rounded bg-slate-800 text-slate-300 light:bg-slate-200 light:text-slate-700 font-semibold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer info: Role card */}
        <div className="p-3 border-t border-slate-800/80 light:border-slate-200 bg-slate-900/40 light:bg-slate-100/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 light:bg-slate-200 light:text-slate-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
              <p className="text-xs font-semibold text-slate-200 light:text-slate-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 light:text-slate-600 capitalize truncate font-mono">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
