import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { TimetableEntry } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Input } from '../components/common/Input.tsx';
import { Select } from '../components/common/Select.tsx';
import { Clock, Plus, Printer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { detectTimetableConflict } from '../utils/academicCalculations.ts';

export const TimetablePage: React.FC = () => {
  const { timetable, classes, subjects, teachers } = useApp();

  const [selectedClassId, setSelectedClassId] = useState('cls_10');
  const [selectedSectionId, setSelectedSectionId] = useState('sec_10a');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form
  const [newEntry, setNewEntry] = useState({
    dayOfWeek: 'Monday' as const,
    periodNumber: 1,
    startTime: '08:30',
    endTime: '09:20',
    subjectId: subjects[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    roomNumber: 'Room 301',
  });
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  const periods = [1, 2, 3, 4, 5, 6];

  const activeClass = classes.find((c) => c.id === selectedClassId);
  const activeSection = activeClass?.sections.find((s) => s.id === selectedSectionId);

  // Entries for the chosen class and section
  const currentEntries = timetable.filter(
    (t) => t.classId === selectedClassId && t.sectionId === selectedSectionId
  );

  const handleValidateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();

    // Check conflict against all existing timetable slots
    const conflictCheck = detectTimetableConflict(timetable, {
      dayOfWeek: newEntry.dayOfWeek,
      periodNumber: newEntry.periodNumber,
      teacherId: newEntry.teacherId,
      roomNumber: newEntry.roomNumber,
    });

    if (conflictCheck.hasConflict) {
      setConflictWarning(conflictCheck.reason || 'Conflict detected');
      return;
    }

    setConflictWarning(null);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Master Academic Timetable
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Weekly period schedule, classroom allocations, and faculty conflict auditing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print Schedule
          </Button>
          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Period
          </Button>
        </div>
      </div>

      {/* Class and Section Filter */}
      <div className="glass-card rounded-xl p-4 border border-slate-800/80 light:border-slate-200 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400 light:text-slate-600">Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              const target = classes.find((c) => c.id === e.target.value);
              if (target && target.sections[0]) {
                setSelectedSectionId(target.sections[0].id);
              }
            }}
            className="bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-100 light:text-slate-900 font-medium focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400 light:text-slate-600">Section:</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-100 light:text-slate-900 font-medium focus:outline-none"
          >
            {activeClass?.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.roomNumber})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 light:text-slate-600 ml-auto font-mono">
          {activeClass?.name} · {activeSection?.name} · Capacity: {activeSection?.capacity}
        </span>
      </div>

      {/* Master Weekly Grid */}
      <div className="glass-card rounded-xl border border-slate-800/80 light:border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800/80 light:border-slate-200 bg-slate-900/60 light:bg-slate-100 text-[11px] font-semibold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-28">Period</th>
                {days.map((day) => (
                  <th key={day} className="py-3 px-4 font-bold text-slate-300 light:text-slate-800">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-xs">
              {periods.map((periodNum) => {
                return (
                  <tr key={periodNum} className="hover:bg-slate-800/20 light:hover:bg-slate-50/70">
                    <td className="py-4 px-4 bg-slate-900/30 light:bg-slate-50/50 border-r border-slate-800/60 light:border-slate-200">
                      <p className="font-bold text-slate-200 light:text-slate-900 font-mono">
                        Period {periodNum}
                      </p>
                      <p className="text-[10px] text-slate-400 light:text-slate-600 font-mono">
                        {periodNum === 1
                          ? '08:30 - 09:20'
                          : periodNum === 2
                          ? '09:25 - 10:15'
                          : periodNum === 3
                          ? '10:30 - 11:20'
                          : periodNum === 4
                          ? '11:25 - 12:15'
                          : periodNum === 5
                          ? '13:00 - 13:50'
                          : '13:55 - 14:45'}
                      </p>
                    </td>

                    {days.map((day) => {
                      const slot = currentEntries.find(
                        (t) => t.dayOfWeek === day && t.periodNumber === periodNum
                      );
                      const subject = subjects.find((s) => s.id === slot?.subjectId);
                      const teacher = teachers.find((t) => t.id === slot?.teacherId);

                      if (!slot || !subject) {
                        return (
                          <td key={day} className="py-3 px-4 text-slate-400 light:text-slate-500 italic text-[11px]">
                            — Study Period —
                          </td>
                        );
                      }

                      return (
                        <td key={day} className="py-3 px-4">
                          <div className="p-2.5 rounded-lg bg-indigo-950/30 light:bg-indigo-50/70 border border-indigo-900/50 light:border-indigo-200 hover:border-indigo-500 transition-colors">
                            <p className="font-semibold text-slate-100 light:text-slate-900 truncate">
                              {subject.name}
                            </p>
                            <p className="text-[10px] text-indigo-400 light:text-indigo-600 font-medium truncate mt-0.5">
                              {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Instructor'}
                            </p>
                            <span className="text-[10px] text-slate-400 light:text-slate-600 font-mono block mt-1">
                              {slot.roomNumber}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Period Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Academic Period"
        subtitle="Allocate course slot with automated conflict audit"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleValidateAndAdd}>
              Assign Period
            </Button>
          </div>
        }
      >
        <form onSubmit={handleValidateAndAdd} className="space-y-4">
          {conflictWarning && (
            <div className="p-3 rounded-lg bg-rose-950/50 light:bg-rose-50 border border-rose-800 light:border-rose-200 text-rose-300 light:text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 light:text-rose-600" />
              <span>{conflictWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Day of Week"
              value={newEntry.dayOfWeek}
              onChange={(e) => setNewEntry({ ...newEntry, dayOfWeek: e.target.value as any })}
              options={days.map((d) => ({ value: d, label: d }))}
            />
            <Select
              label="Period Number"
              value={String(newEntry.periodNumber)}
              onChange={(e) => setNewEntry({ ...newEntry, periodNumber: Number(e.target.value) })}
              options={periods.map((p) => ({ value: String(p), label: `Period ${p}` }))}
            />
          </div>

          <Select
            label="Subject *"
            value={newEntry.subjectId}
            onChange={(e) => setNewEntry({ ...newEntry, subjectId: e.target.value })}
            options={subjects.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }))}
          />

          <Select
            label="Faculty Lead *"
            value={newEntry.teacherId}
            onChange={(e) => setNewEntry({ ...newEntry, teacherId: e.target.value })}
            options={teachers.map((t) => ({ value: t.id, label: `${t.firstName} ${t.lastName} (${t.roleTitle})` }))}
          />

          <Input
            label="Assigned Classroom / Lab *"
            value={newEntry.roomNumber}
            onChange={(e) => setNewEntry({ ...newEntry, roomNumber: e.target.value })}
            placeholder="e.g. Science Lab 102"
          />
        </form>
      </Modal>
    </div>
  );
};
