import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { AppShell } from './components/layout/AppShell.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { StudentsPage } from './pages/StudentsPage.tsx';
import { TeachersPage } from './pages/TeachersPage.tsx';
import { ClassesPage } from './pages/ClassesPage.tsx';
import { SubjectsPage } from './pages/SubjectsPage.tsx';
import { AttendancePage } from './pages/AttendancePage.tsx';
import { TimetablePage } from './pages/TimetablePage.tsx';
import { ExamsPage } from './pages/ExamsPage.tsx';
import { AssignmentsPage } from './pages/AssignmentsPage.tsx';
import { FeesPage } from './pages/FeesPage.tsx';
import { LibraryPage } from './pages/LibraryPage.tsx';
import { TransportPage } from './pages/TransportPage.tsx';
import { CommunicationPage } from './pages/CommunicationPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RequireAuth } from './components/auth/RequireAuth.tsx';
import { RequireRole } from './components/auth/RequireRole.tsx';
import { ROUTE_ACCESS } from './config/access.ts';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route
                  index
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/']}>
                      <DashboardPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="students"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/students']}>
                      <StudentsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="teachers"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/teachers']}>
                      <TeachersPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="classes"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/classes']}>
                      <ClassesPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="subjects"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/subjects']}>
                      <SubjectsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="attendance"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/attendance']}>
                      <AttendancePage />
                    </RequireRole>
                  }
                />
                <Route
                  path="timetable"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/timetable']}>
                      <TimetablePage />
                    </RequireRole>
                  }
                />
                <Route
                  path="exams"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/exams']}>
                      <ExamsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="assignments"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/assignments']}>
                      <AssignmentsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="fees"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/fees']}>
                      <FeesPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="library"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/library']}>
                      <LibraryPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="transport"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/transport']}>
                      <TransportPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="communication"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/communication']}>
                      <CommunicationPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/reports']}>
                      <ReportsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <RequireRole allowedRoles={ROUTE_ACCESS['/settings']}>
                      <SettingsPage />
                    </RequireRole>
                  }
                />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
