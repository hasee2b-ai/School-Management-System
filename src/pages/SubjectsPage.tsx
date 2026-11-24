import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Subject } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Input } from '../components/common/Input.tsx';
import { Select } from '../components/common/Select.tsx';
import { BookOpen, Plus, Search, Award } from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const { subjects, teachers, classes } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Curriculum & Subject Catalog
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Course syllabus, theory and laboratory units, credit allocations, and lead faculty.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card rounded-xl p-4 border border-slate-800/80 light:border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject name or course code..."
            className="w-full bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-200 light:text-slate-800 focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="Theory">Theory</option>
          <option value="Practical">Practical / Lab</option>
          <option value="Elective">Elective</option>
        </select>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubjects.map((subject) => {
          const leadTeacher = teachers.find((t) => t.id === subject.leadTeacherId);
          const applicableClasses = classes.filter((c) =>
            subject.applicableClassIds.includes(c.id)
          );

          return (
            <div
              key={subject.id}
              className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400 light:text-indigo-600">
                    {subject.code}
                  </span>
                  <Badge
                    variant={
                      subject.type === 'Practical'
                        ? 'info'
                        : subject.type === 'Elective'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {subject.type}
                  </Badge>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-100 light:text-slate-900">
                  {subject.name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-400 light:text-slate-600">
                  <p className="flex justify-between">
                    <span className="text-slate-400 light:text-slate-600">Academic Credits:</span>
                    <span className="font-mono text-slate-200 light:text-slate-900 font-semibold">
                      {subject.credits} Credits
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400 light:text-slate-600">Department Lead:</span>
                    <span className="text-slate-300 light:text-slate-800">
                      {leadTeacher ? `${leadTeacher.firstName} ${leadTeacher.lastName}` : 'Faculty Lead'}
                    </span>
                  </p>
                </div>

                {/* Applicable Classes */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 light:border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400 light:text-slate-600 mb-1.5">
                    Offered in Cohorts
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {applicableClasses.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
