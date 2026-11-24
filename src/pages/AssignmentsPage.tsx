import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Assignment } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Input } from '../components/common/Input.tsx';
import { Select } from '../components/common/Select.tsx';
import { FileSpreadsheet, Plus, Calendar, Clock, CheckCircle2, UserCheck } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { assignments, classes, subjects, teachers, addAssignment } = useApp();
  const { currentRole, currentUser } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    classId: classes[1]?.id || 'cls_10',
    sectionId: 'sec_10a',
    subjectId: subjects[0]?.id || 'sub_math',
    dueDate: '2026-11-25',
    totalPoints: 100,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    addAssignment({
      title: form.title,
      description: form.description,
      classId: form.classId,
      sectionId: form.sectionId,
      subjectId: form.subjectId,
      teacherId: currentUser.id,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: form.dueDate,
      totalPoints: form.totalPoints,
      totalStudents: 28,
    });

    setIsAddModalOpen(false);
    setForm({
      title: '',
      description: '',
      classId: 'cls_10',
      sectionId: 'sec_10a',
      subjectId: 'sub_math',
      dueDate: '2026-11-25',
      totalPoints: 100,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Academic Assignments & Homework
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Course deliverables, submission tracking, deadline milestones, and point distributions.
          </p>
        </div>
        {currentRole !== 'student' && currentRole !== 'parent' && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
            Create Assignment
          </Button>
        )}
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.map((asg) => {
          const subject = subjects.find((s) => s.id === asg.subjectId);
          const cls = classes.find((c) => c.id === asg.classId);
          const teacher = teachers.find((t) => t.id === asg.teacherId);
          const completionPct = Math.round((asg.submittedCount / asg.totalStudents) * 100);

          return (
            <div
              key={asg.id}
              className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="default" size="sm">
                    {subject?.name || 'Subject'}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 light:text-amber-700 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due {asg.dueDate}</span>
                  </div>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-100 light:text-slate-900">
                  {asg.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400 light:text-slate-600 line-clamp-2 leading-relaxed">
                  {asg.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/60 light:border-slate-200 text-xs text-slate-400 light:text-slate-600 space-y-1.5">
                  <p className="flex justify-between">
                    <span>Target Cohort:</span>
                    <strong className="text-slate-200 light:text-slate-900 font-medium">
                      {cls?.name || 'Grade 10'} (Section A)
                    </strong>
                  </p>
                  <p className="flex justify-between font-mono">
                    <span>Maximum Assessment:</span>
                    <span className="font-semibold text-slate-200 light:text-slate-900">{asg.totalPoints} Points</span>
                  </p>
                </div>
              </div>

              {/* Progress Bar & Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/60 light:border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-slate-400 light:text-slate-600">Student Submissions:</span>
                  <span className="text-indigo-400 light:text-indigo-600 font-bold">
                    {asg.submittedCount} / {asg.totalStudents} ({completionPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 light:bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Publish Course Assignment"
        subtitle="Distribute problem set or research brief to class cohort"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate}>
              Publish Deliverable
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Assignment Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Thermodynamics and Entropy Laboratory Report"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Subject *"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            />
            <Select
              label="Class Cohort *"
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date *"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <Input
              label="Total Grade Points *"
              type="number"
              value={form.totalPoints}
              onChange={(e) => setForm({ ...form, totalPoints: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 light:text-slate-700 mb-1.5">
              Task Prompt & Specifications
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed instructions, formatting rubrics, or reading requirements..."
              className="w-full rounded-lg bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-300 text-xs p-3 text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
