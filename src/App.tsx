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

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="teachers" element={<TeachersPage />} />
                <Route path="classes" element={<ClassesPage />} />
                <Route path="subjects" element={<SubjectsPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="timetable" element={<TimetablePage />} />
                <Route path="exams" element={<ExamsPage />} />
                <Route path="assignments" element={<AssignmentsPage />} />
                <Route path="fees" element={<FeesPage />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="transport" element={<TransportPage />} />
                <Route path="communication" element={<CommunicationPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
