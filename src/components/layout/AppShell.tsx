import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.tsx';
import { Topbar } from './Topbar.tsx';
import { CommandPalette } from './CommandPalette.tsx';
import { ViewAsBanner } from './ViewAsBanner.tsx';
import { ToastContainer } from '../common/ToastContainer.tsx';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'School Management Console',
  '/students': 'Student Information & Registry',
  '/teachers': 'Faculty & Staff Directory',
  '/classes': 'Classrooms & Section Allocations',
  '/subjects': 'Curriculum & Subject Catalog',
  '/attendance': 'Daily Attendance Console',
  '/timetable': 'Master Academic Timetable',
  '/exams': 'Examinations & Performance Analytics',
  '/assignments': 'Academic Assignments & Homework',
  '/fees': 'Student Billing & Fee Accounting',
  '/library': 'Media Center & Library Catalog',
  '/transport': 'Bus Fleet & Transport Logistics',
  '/communication': 'School Notice Board & Bulletins',
  '/reports': 'Institutional Reports & Analytics',
  '/settings': 'System Administration & Settings',
};

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
    }
    return true;
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    setSidebarOpen(mediaQuery.matches);

    const handleViewportChange = (e: MediaQueryListEvent) => {
      setSidebarOpen(e.matches);
    };

    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  const location = useLocation();
  const pageTitle = ROUTE_TITLES[location.pathname] || 'School Management Console';

  return (
    <div className="min-h-screen bg-transparent light:bg-[#f8fafc] text-slate-100 light:text-slate-900 flex flex-col font-sans transition-colors duration-200">
      <ViewAsBanner />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={`flex-1 flex flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        <Topbar
          title={pageTitle}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};
