import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { AttendanceRecord, AttendanceStatus } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Select } from '../components/common/Select.tsx';
import { Badge } from '../components/common/Badge.tsx';
import {
  CalendarCheck2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Save,
  CheckCheck,
  UserCheck,
} from 'lucide-react';
import { calculateAttendancePercentage, getAttendanceHealth } from '../utils/academicCalculations.ts';

export const AttendancePage: React.FC = () => {
  const { students, classes, attendance, markAttendanceForClass } = useApp();
  const { currentUser } = useAuth();

  const [selectedClassId, setSelectedClassId] = useState('cls_10');
  const [selectedSectionId, setSelectedSectionId] = useState('sec_10a');
  const [selectedDate, setSelectedDate] = useState('2026-11-11');

  // Filter students for this class & section
  const targetStudents = students.filter(
    (s) => s.classId === selectedClassId && s.sectionId === selectedSectionId
  );

  // Local attendance edit state
  const [studentStatuses, setStudentStatuses] = useState<
    Record<string, { status: AttendanceStatus; remarks: string }>
  >({});

  // Sync edit state when class, section, or date changes
  useEffect(() => {
    const existingRecords = attendance.filter(
      (a) =>
        a.classId === selectedClassId &&
        a.sectionId === selectedSectionId &&
        a.date === selectedDate
    );

    const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};

    targetStudents.forEach((student) => {
      const match = existingRecords.find((r) => r.studentId === student.id);
      if (match) {
        initialMap[student.id] = { status: match.status, remarks: match.remarks || '' };
      } else {
        initialMap[student.id] = { status: 'present', remarks: '' };
      }
    });

    setStudentStatuses(initialMap);
  }, [selectedClassId, selectedSectionId, selectedDate, students, attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudentStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    targetStudents.forEach((s) => {
      updated[s.id] = {
        status,
        remarks: studentStatuses[s.id]?.remarks || '',
      };
    });
    setStudentStatuses(updated);
  };

  const handleSaveAttendance = () => {
    const records = targetStudents.map((s) => ({
      studentId: s.id,
      status: studentStatuses[s.id]?.status || 'present',
      remarks: studentStatuses[s.id]?.remarks,
    }));

    markAttendanceForClass(
      selectedClassId,
      selectedSectionId,
      selectedDate,
      records,
      currentUser.id
    );
  };

  // Live metrics calculation
  const total = targetStudents.length;
  const present = Object.values(studentStatuses).filter((v) => v.status === 'present').length;
  const absent = Object.values(studentStatuses).filter((v) => v.status === 'absent').length;
  const late = Object.values(studentStatuses).filter((v) => v.status === 'late').length;
  const excused = Object.values(studentStatuses).filter((v) => v.status === 'excused').length;
  const currentRate = total > 0 ? calculateAttendancePercentage(present, total) : 0;
  const health = getAttendanceHealth(currentRate);

  const activeClass = classes.find((c) => c.id === selectedClassId);
  const activeSection = activeClass?.sections.find((s) => s.id === selectedSectionId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Daily Attendance Console
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Record roll call, register tardiness, excused absences, and export session logs.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            icon={<CheckCheck className="w-4 h-4" />}
            onClick={() => handleMarkAll('present')}
          >
            Mark All Present
          </Button>
          <Button
            size="sm"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSaveAttendance}
          >
            Save Roll Call
          </Button>
        </div>
      </div>

      {/* Control Strip & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Controls */}
        <div className="lg:col-span-3 glass-card rounded-xl p-4 border border-slate-800/80 light:border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 light:text-slate-600 mb-1.5">
              Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                const target = classes.find((c) => c.id === e.target.value);
                if (target && target.sections[0]) {
                  setSelectedSectionId(target.sections[0].id);
                }
              }}
              className="w-full bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-100 light:text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 light:text-slate-600 mb-1.5">
              Section
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-100 light:text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {activeClass?.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 light:text-slate-600 mb-1.5">
              Session Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-100 light:text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Live Attendance Metric Card */}
        <div className="glass-card rounded-xl p-4 border border-slate-800/80 light:border-slate-200 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 light:text-slate-600 uppercase tracking-wider">
              Session Rate
            </span>
            <Badge
              variant={health === 'good' ? 'success' : health === 'warning' ? 'warning' : 'danger'}
              size="sm"
            >
              {health.toUpperCase()}
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100 light:text-slate-900 tabular-nums">
              {currentRate}%
            </span>
            <span className="text-xs text-slate-400 light:text-slate-600">
              ({present}/{total} present)
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 light:text-slate-600 font-mono border-t border-slate-800 light:border-slate-200 pt-2">
            <span>Absent: {absent}</span>
            <span>Late: {late}</span>
            <span>Excused: {excused}</span>
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="glass-card rounded-xl border border-slate-800/80 light:border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 light:border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900">
            Roster: {activeClass?.name} - {activeSection?.name} ({targetStudents.length} Students)
          </h3>
          <span className="text-xs font-mono text-slate-400 light:text-slate-600">Date: {selectedDate}</span>
        </div>

        {targetStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 light:text-slate-600">
            No enrolled students in this section.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 light:border-slate-200 bg-slate-900/40 light:bg-slate-100/60 text-[11px] font-semibold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Status Selector</th>
                  <th className="py-3 px-4">Remarks / Explanation</th>
                  <th className="py-3 px-4 text-right">Term Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 light:divide-slate-200/70 text-xs">
                {targetStudents.map((s) => {
                  const currentStatus = studentStatuses[s.id]?.status || 'present';
                  const currentRemarks = studentStatuses[s.id]?.remarks || '';

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-300 light:text-slate-700">
                        {s.rollNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {s.firstName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 light:text-slate-900">
                              {s.firstName} {s.lastName}
                            </p>
                            <p className="text-[11px] text-slate-400 light:text-slate-600 font-mono">
                              {s.admissionNumber}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex rounded-lg bg-slate-900/90 light:bg-slate-200 p-0.5 border border-slate-800 light:border-slate-300">
                          {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map(
                            (st) => {
                              const isActive = currentStatus === st;
                              const colors = {
                                present: isActive ? 'bg-emerald-700 text-white' : 'text-slate-400 light:text-slate-700',
                                absent: isActive ? 'bg-rose-700 text-white' : 'text-slate-400 light:text-slate-700',
                                late: isActive ? 'bg-amber-700 text-white' : 'text-slate-400 light:text-slate-700',
                                excused: isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 light:text-slate-700',
                              }[st];

                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleStatusChange(s.id, st)}
                                  className={`px-2.5 py-1 text-[11px] font-medium rounded capitalize transition-all ${colors}`}
                                >
                                  {st}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                          placeholder="Optional notes..."
                          className="w-full bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded px-2.5 py-1 text-xs text-slate-200 light:text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300 light:text-slate-700">
                        {s.attendanceRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
