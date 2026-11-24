import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';
import { StatCard } from '../components/common/StatCard.tsx';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import {
  GraduationCap,
  Users,
  Layers,
  CalendarCheck2,
  DollarSign,
  Award,
  BookOpen,
  Bus,
  Megaphone,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { calculateFeeMetrics } from '../utils/academicCalculations.ts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole, currentUser } = useAuth();
  const {
    students,
    teachers,
    classes,
    subjects,
    attendance,
    invoices,
    exams,
    assignments,
    announcements,
    timetable,
    books,
    routes,
    settings,
    theme,
  } = useApp();

  // Metrics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;

  const todayStr = '2026-11-11';
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const attendanceRate =
    todayAttendance.length > 0
      ? Math.round((presentCount / todayAttendance.length) * 1000) / 10
      : 96.2;

  const feeMetrics = calculateFeeMetrics(invoices);

  // Enrollment trend data for chart
  const enrollmentTrend = [
    { year: '2022', students: 142 },
    { year: '2023', students: 168 },
    { year: '2024', students: 184 },
    { year: '2025', students: 195 },
    { year: '2026', students: 210 },
  ];

  // Monthly collection data
  const revenueData = [
    { month: 'Jul', collected: 24000, target: 20000 },
    { month: 'Aug', collected: 52000, target: 50000 },
    { month: 'Sep', collected: 44000, target: 40000 },
    { month: 'Oct', collected: 31000, target: 30000 },
    { month: 'Nov', collected: 18500, target: 25000 },
  ];

  // Specific data for Student/Parent views (Liam Evans)
  const studentProfile = students.find((s) => s.id === 'stu_01') || students[0];
  const studentInvoices = invoices.filter((i) => i.studentId === studentProfile?.id);
  const studentAssignments = assignments.filter((a) => a.classId === studentProfile?.classId);
  const todayTimetable = timetable.filter(
    (t) => t.classId === 'cls_10' && t.sectionId === 'sec_10a' && t.dayOfWeek === 'Monday'
  );

  // ----------------------------------------------------
  // ROLE 1: ADMIN & PRINCIPAL BENTO GRID
  // ----------------------------------------------------
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Top Banner: Institutional Summary Bento Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800/80 light:border-slate-300 light:bg-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-indigo-400 light:text-indigo-600 uppercase tracking-wider">
                Operational Overview
              </span>
              <span className="text-slate-500 light:text-slate-400">·</span>
              <span className="text-xs text-slate-400 light:text-slate-600 font-mono">Academic Year {settings.currentAcademicYear}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 light:text-slate-900 tracking-tight">
              {settings.schoolName}
            </h2>
            <p className="mt-2 text-sm text-slate-400 light:text-slate-600 leading-relaxed">
              {settings.tagline}. Head of Institution: <strong className="text-slate-200 light:text-slate-900">{settings.principalName}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/students')}
            >
              Enroll Student
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<DollarSign className="w-4 h-4" />}
              onClick={() => navigate('/fees')}
            >
              Collect Fees
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<CalendarCheck2 className="w-4 h-4" />}
              onClick={() => navigate('/attendance')}
            >
              Mark Attendance
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled"
          value={totalStudents}
          subtitle="Across Grades 9 to 12"
          icon={<GraduationCap className="w-5 h-5" />}
          trend={{ value: '8.4%', isPositive: true, label: 'vs last year' }}
          onClick={() => navigate('/students')}
        />
        <StatCard
          title="Faculty & Staff"
          value={totalTeachers}
          subtitle="Full-time certified educators"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: '100%', isPositive: true, label: 'deployed' }}
          onClick={() => navigate('/teachers')}
        />
        <StatCard
          title="Today's Attendance"
          value={`${attendanceRate}%`}
          subtitle={`${presentCount} present on campus`}
          icon={<CalendarCheck2 className="w-5 h-5" />}
          trend={{ value: '0.8%', isPositive: true, label: 'nominal' }}
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Tuition Collected"
          value={`$${feeMetrics.totalCollected.toLocaleString()}`}
          subtitle={`$${feeMetrics.totalOutstanding.toLocaleString()} pending`}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: `${feeMetrics.collectionRate}%`, isPositive: true, label: 'cleared' }}
          onClick={() => navigate('/fees')}
        />
      </div>

      {/* Bento Grid: Charts & Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Financial Ledger Trend (Col Span 2) */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900">
                Revenue Inflows vs Budget Target
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Monthly tuition & auxiliary billing performance (USD)
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/fees')}>
              Ledger <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke={theme === 'dark' ? '#6e7b8b' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#6e7b8b' : '#64748b'} fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={
                    theme === 'dark'
                      ? { backgroundColor: '#111519', borderColor: '#2a313c', borderRadius: '8px', color: '#f3f5f8', fontSize: '12px' }
                      : { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }
                  }
                  formatter={(val: any) => [`$${val?.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="collected" fill={theme === 'dark' ? '#14b8a6' : '#4f46e5'} radius={[4, 4, 0, 0]} name="Collected" />
                <Bar dataKey="target" fill={theme === 'dark' ? '#2a313c' : '#cbd5e1'} radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Upcoming Exam Schedules */}
        <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900">
              Exam Milestones
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/exams')}>
              Schedule <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {exams.map((ex) => (
              <div
                key={ex.id}
                className="p-3 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800/60 light:border-slate-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-200 light:text-slate-900">
                    {ex.title}
                  </p>
                  <Badge variant={ex.status === 'published' ? 'success' : 'neutral'} size="sm">
                    {ex.status}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 light:text-slate-600 font-mono">
                  <span>Starts: {ex.startDate}</span>
                  <span>{ex.academicTerm}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Bento: Enrollment Growth + Announcements + Fleet Logistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Admission Growth Trend */}
        <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200">
          <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900 mb-1">
            5-Year Enrollment Trajectory
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 mb-4">
            Net registered student growth trend
          </p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? '#38bdf8' : '#10b981'} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={theme === 'dark' ? '#38bdf8' : '#10b981'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke={theme === 'dark' ? '#6e7b8b' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#6e7b8b' : '#64748b'} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={
                    theme === 'dark'
                      ? { backgroundColor: '#111519', borderColor: '#2a313c', borderRadius: '8px', color: '#f3f5f8', fontSize: '12px' }
                      : { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }
                  }
                />
                <Area type="monotone" dataKey="students" stroke={theme === 'dark' ? '#38bdf8' : '#10b981'} fillOpacity={1} fill="url(#enrollGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Notices */}
        <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900">
              Campus Bulletins
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/communication')}>
              All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {announcements.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800/60 light:border-slate-200"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant={a.priority === 'urgent' ? 'danger' : 'default'} size="sm">
                    {a.priority}
                  </Badge>
                  <span className="text-[10px] text-slate-400 light:text-slate-600 font-mono">
                    {a.publishedAt.split('T')[0]}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200 light:text-slate-900 truncate">
                  {a.title}
                </p>
                <p className="text-[11px] text-slate-400 light:text-slate-600 line-clamp-1 mt-0.5">
                  {a.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Auxiliary Operations: Fleet & Media Center */}
        <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900">
            Logistics & Auxiliary
          </h3>

          <div
            onClick={() => navigate('/transport')}
            className="p-3.5 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 cursor-pointer hover:border-slate-700 light:hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bus className="w-4 h-4 text-amber-400 light:text-amber-700" />
                <span className="text-xs font-semibold text-slate-200 light:text-slate-900">
                  Bus Transport Fleet
                </span>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 light:text-slate-600">
              {routes.length} active routes, 103 students transported daily.
            </p>
          </div>

          <div
            onClick={() => navigate('/library')}
            className="p-3.5 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 cursor-pointer hover:border-slate-700 light:hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-sky-400 light:text-sky-600" />
                <span className="text-xs font-semibold text-slate-200 light:text-slate-900">
                  Media Library
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 light:text-slate-600">{books.length} titles</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 light:text-slate-600">
              Physical catalog in circulation with automated loan checks.
            </p>
          </div>

          <div
            onClick={() => navigate('/classes')}
            className="p-3.5 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 cursor-pointer hover:border-slate-700 light:hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-purple-400 light:text-purple-600" />
                <span className="text-xs font-semibold text-slate-200 light:text-slate-900">
                  Classrooms
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 light:text-slate-600">{totalClasses} classes</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 light:text-slate-600">
              Room allocation and teacher-to-section matrices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ----------------------------------------------------
  // ROLE 2: TEACHER BENTO GRID
  // ----------------------------------------------------
  const renderTeacherDashboard = () => (
    <div className="space-y-6">
      {/* Teacher Welcome Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 light:border-slate-300 light:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 light:text-indigo-600 uppercase tracking-wider">
            Faculty Dashboard
          </span>
          <h2 className="text-2xl font-bold text-slate-100 light:text-slate-900 mt-1">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Head of Mathematics · Assigned Classes: Grade 10-A, Grade 12-A
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button size="sm" icon={<CalendarCheck2 className="w-4 h-4" />} onClick={() => navigate('/attendance')}>
            Mark Class Attendance
          </Button>
          <Button size="sm" variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/assignments')}>
            New Assignment
          </Button>
        </div>
      </div>

      {/* Teacher Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Teaching Schedule */}
        <div className="md:col-span-2 glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900">
              Today's Lecture Schedule
            </h3>
            <span className="text-xs font-mono text-slate-400 light:text-slate-600">Monday Timetable</span>
          </div>
          <div className="space-y-3">
            {todayTimetable.slice(0, 4).map((entry) => {
              const subj = subjects.find((s) => s.id === entry.subjectId);
              const teacher = teachers.find((t) => t.id === entry.teacherId);
              return (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-400 light:bg-indigo-100 light:text-indigo-700 flex items-center justify-center font-bold text-xs font-mono">
                      P{entry.periodNumber}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200 light:text-slate-900">
                        Period {entry.periodNumber}: {subj?.name || 'Class Period'}
                      </p>
                      <p className="text-[11px] text-slate-400 light:text-slate-600">
                        {entry.roomNumber} · {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Faculty Lead'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-300 light:text-slate-700">
                      {entry.startTime} - {entry.endTime}
                    </span>
                    <Badge variant="default" size="sm" className="ml-2">Scheduled</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Grading / Tasks */}
        <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900 mb-3">
              Assignments to Grade
            </h3>
            <div className="space-y-3">
              {assignments.slice(0, 3).map((asg) => (
                <div
                  key={asg.id}
                  className="p-3 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800/60 light:border-slate-200"
                >
                  <p className="text-xs font-semibold text-slate-200 light:text-slate-900 truncate">
                    {asg.title}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 light:text-slate-600">
                    <span>Due: {asg.dueDate}</span>
                    <span className="font-mono text-indigo-400 light:text-indigo-600">
                      {asg.submittedCount}/{asg.totalStudents} submitted
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate('/assignments')}
          >
            Review All Submissions
          </Button>
        </div>
      </div>
    </div>
  );

  // ----------------------------------------------------
  // ROLE 3: STUDENT & PARENT BENTO GRID
  // ----------------------------------------------------
  const renderStudentOrParentDashboard = () => (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 light:border-slate-300 light:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 light:text-indigo-600 uppercase tracking-wider">
            {currentRole === 'parent' ? 'Parent & Guardian Portal' : 'Student Academic Console'}
          </span>
          <h2 className="text-2xl font-bold text-slate-100 light:text-slate-900 mt-1">
            {studentProfile?.firstName} {studentProfile?.lastName}
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Admission No: <strong className="font-mono text-slate-300 light:text-slate-700">{studentProfile?.admissionNumber}</strong> · Grade 10 - Section A · Roll: {studentProfile?.rollNumber}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button size="sm" icon={<Award className="w-4 h-4" />} onClick={() => navigate('/exams')}>
            View Term Results
          </Button>
          <Button size="sm" variant="secondary" icon={<DollarSign className="w-4 h-4" />} onClick={() => navigate('/fees')}>
            Fee Invoices
          </Button>
        </div>
      </div>

      {/* Student Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${studentProfile?.attendanceRate}%`}
          subtitle="96 of 100 days present"
          icon={<CalendarCheck2 className="w-5 h-5" />}
          trend={{ value: 'Good', isPositive: true }}
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Term Grade Point"
          value="3.85 GPA"
          subtitle="Rank 2 in Section 10-A"
          icon={<Award className="w-5 h-5" />}
          trend={{ value: 'Top 5%', isPositive: true }}
          onClick={() => navigate('/exams')}
        />
        <StatCard
          title="Pending Homework"
          value={studentAssignments.length}
          subtitle="Active submissions"
          icon={<FileSpreadsheet className="w-5 h-5" />}
          onClick={() => navigate('/assignments')}
        />
        <StatCard
          title="Tuition Balance"
          value={`$${studentInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)}`}
          subtitle="Lab fee due Nov 30"
          icon={<DollarSign className="w-5 h-5" />}
          onClick={() => navigate('/fees')}
        />
      </div>

      {/* Student Bento Grid: Today's Class + Pending Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900">
              Today's Classes
            </h3>
            <span className="text-xs font-mono text-slate-400 light:text-slate-600">Monday Schedule</span>
          </div>
          <div className="space-y-3">
            {todayTimetable.slice(0, 4).map((entry) => {
              const subj = subjects.find((s) => s.id === entry.subjectId);
              const teacher = teachers.find((t) => t.id === entry.teacherId);
              return (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200 light:text-slate-900">
                      Period {entry.periodNumber}: {subj?.name || 'Academic Class'}
                    </p>
                    <p className="text-[11px] text-slate-400 light:text-slate-600">
                      {entry.roomNumber} · {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Instructor'}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 light:text-slate-600">
                    {entry.startTime} - {entry.endTime}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900">
              Upcoming Deadlines
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/assignments')}>
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {studentAssignments.slice(0, 3).map((asg) => (
              <div
                key={asg.id}
                className="p-3 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800/60 light:border-slate-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-200 light:text-slate-900">
                    {asg.title}
                  </p>
                  <Badge variant="warning" size="sm">Due {asg.dueDate}</Badge>
                </div>
                <p className="text-[11px] text-slate-400 light:text-slate-600 mt-1 line-clamp-1">
                  {asg.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {currentRole === 'teacher'
        ? renderTeacherDashboard()
        : currentRole === 'student' || currentRole === 'parent'
        ? renderStudentOrParentDashboard()
        : renderAdminDashboard()}
    </div>
  );
};
