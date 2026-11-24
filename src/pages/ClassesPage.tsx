import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Input } from '../components/common/Input.tsx';
import { Select } from '../components/common/Select.tsx';
import { Layers, Users, BookOpen, Plus, DoorOpen } from 'lucide-react';

export const ClassesPage: React.FC = () => {
  const { classes, teachers, students } = useApp();

  const [selectedClass, setSelectedClass] = useState(classes[1] || classes[0]);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Classrooms & Section Allocations
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Grade structures, cohort capacities, designated homeroom teachers, and physical rooms.
          </p>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {classes.map((cls) => {
          const isSelected = selectedClass?.id === cls.id;
          const enrolled = students.filter((s) => s.classId === cls.id).length;

          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`p-5 rounded-xl glass-card border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500/80 bg-indigo-950/20 light:bg-indigo-50/70 shadow-lg'
                  : 'border-slate-800/80 light:border-slate-200 hover:border-slate-700 light:hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 light:text-indigo-600">
                  {cls.code}
                </span>
                <Badge variant="default" size="sm">
                  {cls.sections.length} Sections
                </Badge>
              </div>

              <h3 className="mt-3 text-lg font-bold text-slate-100 light:text-slate-900">
                {cls.name}
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-1">Academic Year {cls.academicYear}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/60 light:border-slate-200 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 light:text-slate-600">Enrolled:</span>
                <span className="font-bold text-slate-200 light:text-slate-900">
                  {enrolled} Students
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Section Breakdown for Selected Class */}
      {selectedClass && (
        <div className="glass-card rounded-xl p-6 border border-slate-800/80 light:border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 light:border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 light:text-slate-900">
                {selectedClass.name} - Cohort Sections
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Room allocations, homeroom supervisors, and capacity limits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedClass.sections.map((sec) => {
              const teacher = teachers.find((t) => t.id === sec.classTeacherId);
              const sectionStudents = students.filter(
                (s) => s.classId === selectedClass.id && s.sectionId === sec.id
              );

              return (
                <div
                  key={sec.id}
                  className="p-5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-indigo-400 light:text-indigo-600" />
                      <h4 className="text-sm font-bold text-slate-100 light:text-slate-900">
                        {sec.name}
                      </h4>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {sec.roomNumber}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 light:text-slate-700">
                    <p className="flex justify-between">
                      <span className="text-slate-400 light:text-slate-600">Lead Homeroom Faculty:</span>
                      <strong className="font-medium text-slate-200 light:text-slate-900">
                        {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned'}
                      </strong>
                    </p>
                    <p className="flex justify-between font-mono">
                      <span className="text-slate-400 light:text-slate-600">Classroom Capacity:</span>
                      <span>{sec.capacity} Desks</span>
                    </p>
                    <p className="flex justify-between font-mono">
                      <span className="text-slate-400 light:text-slate-600">Current Occupancy:</span>
                      <span className="text-emerald-400 light:text-emerald-700 font-bold">
                        {sectionStudents.length} Students
                      </span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 light:border-slate-200 flex items-center justify-between text-xs text-slate-400 light:text-slate-600">
                    <span>Utilization Rate:</span>
                    <span className="font-mono font-semibold text-slate-200 light:text-slate-900">
                      {Math.round((sectionStudents.length / sec.capacity) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
