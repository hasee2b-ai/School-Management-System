import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Button } from '../components/common/Button.tsx';
import { Input } from '../components/common/Input.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Settings, Shield, RefreshCw, Save, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDemoDefaults } = useApp();
  const { currentUser, currentRole } = useAuth();

  const [form, setForm] = useState({
    schoolName: settings.schoolName,
    tagline: settings.tagline,
    affiliationNumber: settings.affiliationNumber,
    principalName: settings.principalName,
    email: settings.email,
    phone: settings.phone,
    address: settings.address,
    website: settings.website,
    currentAcademicYear: settings.currentAcademicYear,
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  const auditLogs = [
    { action: 'Attendance Recorded', actor: 'Marcus Holloway', time: 'Today at 08:45 AM', target: 'Grade 10-A (28 Students)' },
    { action: 'Fee Payment Received', actor: 'Julian Sterling', time: 'Yesterday at 03:12 PM', target: 'Invoice #INV-2026-8801 ($4,000)' },
    { action: 'Exam Schedule Published', actor: 'Dr. Eleanor Vance', time: 'Nov 10, 2026', target: 'Mid-Term Examination 2026' },
    { action: 'Student Enrolled', actor: 'Sarah Mitchell', time: 'Nov 08, 2026', target: 'Liam Evans (ADM-2024-0089)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            System Administration & Institutional Settings
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            School identity, academic scale benchmarks, security audit trails, and backup options.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="glass-card rounded-xl p-6 border border-slate-800/80 light:border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
              Institution Identity Profile
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-600">
              This information prints on report cards, fee receipts, and official transcripts.
            </p>
          </div>
          <Button size="sm" icon={<Save className="w-4 h-4" />} onClick={handleSave}>
            Save Changes
          </Button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Institution Full Legal Name"
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
            />
            <Input
              label="Academic Tagline / Motto"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Affiliation Accreditation Code"
              value={form.affiliationNumber}
              onChange={(e) => setForm({ ...form, affiliationNumber: e.target.value })}
            />
            <Input
              label="Principal / Head of Institution"
              value={form.principalName}
              onChange={(e) => setForm({ ...form, principalName: e.target.value })}
            />
            <Input
              label="Active Academic Year"
              value={form.currentAcademicYear}
              onChange={(e) => setForm({ ...form, currentAcademicYear: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Administrative Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Office Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Official Website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>

          <Input
            label="Campus Postal Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </form>
      </div>

      {/* Grading Scale Benchmarks */}
      <div className="glass-card rounded-xl p-6 border border-slate-800/80 light:border-slate-200">
        <h3 className="text-sm font-bold text-slate-100 light:text-slate-900 mb-1">
          Grading Scale & GPA Equivalency Matrix
        </h3>
        <p className="text-xs text-slate-400 light:text-slate-600 mb-4">
          Institutional standards configured for automated report cards.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 light:border-slate-200 bg-slate-900/60 light:bg-slate-100 text-[11px] font-semibold text-slate-400 light:text-slate-600 uppercase">
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Percentage Range</th>
                <th className="py-2.5 px-3">GPA Equivalent</th>
                <th className="py-2.5 px-3">Descriptor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
              {settings.gradingScale.map((scale) => (
                <tr key={scale.grade} className="hover:bg-slate-800/20 light:hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-100 light:text-slate-900">{scale.grade}</td>
                  <td className="py-2.5 px-3 text-slate-300 light:text-slate-700">
                    {scale.minPercentage}% - {scale.maxPercentage}%
                  </td>
                  <td className="py-2.5 px-3 font-bold text-indigo-400 light:text-indigo-600">{scale.gpa.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-slate-400 light:text-slate-600">{scale.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="glass-card rounded-xl p-6 border border-slate-800/80 light:border-slate-200">
        <h3 className="text-sm font-bold text-slate-100 light:text-slate-900 mb-1">
          Institutional System Audit Logs
        </h3>
        <p className="text-xs text-slate-400 light:text-slate-600 mb-4">
          Real-time event logging of grade entries, financial transactions, and credential changes.
        </p>

        <div className="space-y-2.5">
          {auditLogs.map((log, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-900/50 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 light:bg-emerald-500" />
                <div>
                  <span className="font-semibold text-slate-200 light:text-slate-900">{log.action}</span>
                  <span className="text-slate-400 light:text-slate-600 text-[11px] ml-2">by {log.actor}</span>
                  <p className="text-[11px] text-slate-400 light:text-slate-600 font-mono mt-0.5">{log.target}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 light:text-slate-600 font-mono shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone: Reset to Default Seed Data */}
      <div className="glass-card rounded-xl p-6 border border-rose-950/60 light:border-rose-200 bg-rose-950/10 light:bg-rose-50/70 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 light:text-rose-700 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Demo Data Management & System Reset</span>
        </div>
        <p className="text-xs text-slate-400 light:text-slate-700 leading-relaxed max-w-2xl">
          Restores all local storage records (students, teachers, class allocations, invoices, library loans, attendance records) back to the pristine default demonstration state.
        </p>
        <div>
          <Button
            size="sm"
            variant="danger"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => setIsResetModalOpen(true)}
          >
            Reset to Demo Defaults
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Demo State Reset"
        subtitle="This action will restore all entities to the pristine sample dataset"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                resetToDemoDefaults();
                setIsResetModalOpen(false);
              }}
            >
              Confirm Reset
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
          Are you sure you want to revert all changes? Any newly registered students, modified grades, recorded attendance, or invoice payments will be refreshed to default presets.
        </p>
      </Modal>
    </div>
  );
};
