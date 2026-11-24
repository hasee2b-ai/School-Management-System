import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Tabs } from '../components/common/Tabs.tsx';
import { BarChart3, Download, Printer, Filter } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { calculateFeeMetrics } from '../utils/academicCalculations.ts';

export const ReportsPage: React.FC = () => {
  const { students, classes, invoices, theme } = useApp();
  const [reportType, setReportType] = useState<'finance' | 'academics' | 'attendance'>('finance');

  const feeMetrics = calculateFeeMetrics(invoices);

  // Fee categories data
  const feeCategoryData = [
    { name: 'Tuition', value: 16400, color: theme === 'dark' ? '#14b8a6' : '#6366f1' },
    { name: 'Transport', value: 3400, color: theme === 'dark' ? '#38bdf8' : '#10b981' },
    { name: 'Laboratory', value: 2100, color: '#f59e0b' },
    { name: 'Extracurricular', value: 1350, color: '#fb7185' },
  ];

  // Grade distribution
  const gradeDistribution = [
    { grade: 'A+ (90-100%)', count: 6, fill: theme === 'dark' ? '#14b8a6' : '#10b981' },
    { grade: 'A (80-89%)', count: 4, fill: theme === 'dark' ? '#38bdf8' : '#6366f1' },
    { grade: 'B (70-79%)', count: 2, fill: '#3b82f6' },
    { grade: 'C (60-69%)', count: 0, fill: '#f59e0b' },
    { grade: 'F (<50%)', count: 0, fill: '#ef4444' },
  ];

  // Attendance by class
  const classAttendanceData = classes.map((c) => {
    const classStudents = students.filter((s) => s.classId === c.id);
    const avgRate =
      classStudents.length > 0
        ? Math.round(
            (classStudents.reduce((acc, s) => acc + s.attendanceRate, 0) / classStudents.length) * 10
          ) / 10
        : 95.0;
    return {
      className: c.name,
      rate: avgRate,
    };
  });

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'finance') {
      csvContent += 'InvoiceNumber,StudentId,Category,TotalAmount,PaidAmount,Status,DueDate\n';
      invoices.forEach((inv) => {
        csvContent += `${inv.invoiceNumber},${inv.studentId},${inv.category},${inv.totalAmount},${inv.paidAmount},${inv.status},${inv.dueDate}\n`;
      });
    } else {
      csvContent += 'AdmissionNumber,StudentName,Class,AttendanceRate\n';
      students.forEach((s) => {
        csvContent += `${s.admissionNumber},${s.firstName} ${s.lastName},${s.classId},${s.attendanceRate}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `school_report_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Institutional Reports & Analytics
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Aggregated institutional metrics, fiscal clearance rates, and cohorts analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" icon={<Download className="w-4 h-4" />} onClick={exportCSV}>
            Export CSV
          </Button>
          <Button size="sm" variant="secondary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
            Print Brief
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={reportType}
        onChange={(tab) => setReportType(tab as any)}
        tabs={[
          { id: 'finance', label: 'Financial & Billing' },
          { id: 'academics', label: 'Academic & Gradebook' },
          { id: 'attendance', label: 'Attendance Cohorts' },
        ]}
      />

      {/* Report 1: Finance */}
      {reportType === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200">
              <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900 mb-2">
                Fee Collection by Category
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mb-4">Distribution of billed amounts (USD)</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feeCategoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {feeCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={
                        theme === 'dark'
                          ? { backgroundColor: '#111519', borderColor: '#2a313c', borderRadius: '8px', color: '#f3f5f8', fontSize: '12px' }
                          : { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }
                      }
                      formatter={(val: any) => [`$${val?.toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                {feeCategoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-400 light:text-slate-600">{cat.name}:</span>
                    <span className="font-bold text-slate-200 light:text-slate-900">${cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900 mb-2">
                  Receivables Audit Summary
                </h3>
                <p className="text-xs text-slate-400 light:text-slate-600 mb-4">Institutional clearance indicators</p>
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-3.5 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex justify-between">
                    <span className="text-slate-400 light:text-slate-600">Total Invoiced:</span>
                    <span className="font-bold text-slate-100 light:text-slate-900">${feeMetrics.totalBilled.toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex justify-between">
                    <span className="text-slate-400 light:text-slate-600">Total Settled:</span>
                    <span className="font-bold text-emerald-400 light:text-emerald-700">${feeMetrics.totalCollected.toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 flex justify-between">
                    <span className="text-slate-400 light:text-slate-600">Outstanding Receivables:</span>
                    <span className="font-bold text-rose-400 light:text-rose-700">${feeMetrics.totalOutstanding.toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-indigo-950/30 light:bg-indigo-50 border border-indigo-800 light:border-indigo-200 flex justify-between text-indigo-300 light:text-indigo-700">
                    <span>Overall Collection Efficiency:</span>
                    <span className="font-bold">{feeMetrics.collectionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report 2: Academics */}
      {reportType === 'academics' && (
        <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200">
          <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900 mb-2">
            Autumn 2026 Examination Grade Spectrum
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 mb-4">Frequency breakdown of final student grades</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="grade" stroke={theme === 'dark' ? '#6e7b8b' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#6e7b8b' : '#64748b'} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={
                    theme === 'dark'
                      ? { backgroundColor: '#111519', borderColor: '#2a313c', borderRadius: '8px', color: '#f3f5f8', fontSize: '12px' }
                      : { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }
                  }
                />
                <Bar dataKey="count" fill={theme === 'dark' ? '#14b8a6' : '#6366f1'} radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Report 3: Attendance */}
      {reportType === 'attendance' && (
        <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200">
          <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900 mb-2">
            Average Attendance Rate by Class Cohort
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 mb-4">Percentage of present days across grades</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAttendanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="className" stroke={theme === 'dark' ? '#6e7b8b' : '#64748b'} fontSize={11} tickLine={false} />
                <YAxis stroke={theme === 'dark' ? '#6e7b8b' : '#64748b'} fontSize={11} domain={[80, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={
                    theme === 'dark'
                      ? { backgroundColor: '#111519', borderColor: '#2a313c', borderRadius: '8px', color: '#f3f5f8', fontSize: '12px' }
                      : { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }
                  }
                  formatter={(val: any) => [`${val}%`, 'Attendance Rate']}
                />
                <Bar dataKey="rate" fill={theme === 'dark' ? '#38bdf8' : '#10b981'} radius={[4, 4, 0, 0]} name="Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
