import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Announcement } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Input } from '../components/common/Input.tsx';
import { Select } from '../components/common/Select.tsx';
import { Tabs } from '../components/common/Tabs.tsx';
import { Megaphone, Plus, Pin, Trash2, Calendar, UserCheck } from 'lucide-react';

export const CommunicationPage: React.FC = () => {
  const { announcements, addAnnouncement, deleteAnnouncement } = useApp();
  const { currentUser, currentRole } = useAuth();

  const [audienceFilter, setAudienceFilter] = useState<'all' | 'students' | 'teachers' | 'parents'>('all');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    targetAudience: 'all' as 'all' | 'students' | 'teachers' | 'parents',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    pinned: false,
  });

  const filteredAnnouncements = announcements.filter(
    (a) => audienceFilter === 'all' || a.targetAudience === audienceFilter || a.targetAudience === 'all'
  );

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    addAnnouncement({
      title: form.title,
      content: form.content,
      targetAudience: form.targetAudience,
      priority: form.priority,
      pinned: form.pinned,
      authorName: currentUser.name,
      authorRole: currentUser.role.replace('_', ' ').toUpperCase(),
    });

    setIsPublishModalOpen(false);
    setForm({
      title: '',
      content: '',
      targetAudience: 'all',
      priority: 'normal',
      pinned: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            School Notice Board & Bulletins
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Official communiques, academic circulars, calendar reminders, and urgent broadcasts.
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsPublishModalOpen(true)}>
          Publish Bulletin
        </Button>
      </div>

      {/* Tabs Filter */}
      <Tabs
        activeTab={audienceFilter}
        onChange={(tab) => setAudienceFilter(tab as any)}
        tabs={[
          { id: 'all', label: 'All Notices', count: announcements.length },
          { id: 'students', label: 'Student Bulletins' },
          { id: 'teachers', label: 'Staff Memorandums' },
          { id: 'parents', label: 'Parent Circulars' },
        ]}
      />

      {/* Notices List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((item) => (
          <div
            key={item.id}
            className={`glass-card rounded-xl p-5 border transition-all duration-200 ${
              item.pinned
                ? 'border-indigo-500/60 bg-indigo-950/10 light:bg-indigo-50/50 light:border-indigo-300'
                : 'border-slate-800/80 light:border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {item.pinned && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 light:text-indigo-600">
                      <Pin className="w-3.5 h-3.5" /> Pinned
                    </span>
                  )}
                  <Badge
                    variant={
                      item.priority === 'urgent'
                        ? 'danger'
                        : item.priority === 'important'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {item.priority}
                  </Badge>
                  <span className="text-xs text-slate-500 light:text-slate-400">·</span>
                  <span className="text-xs text-slate-400 light:text-slate-600 capitalize">
                    Audience: {item.targetAudience}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 light:text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-300 light:text-slate-700 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
              </div>

              {currentRole === 'super_admin' || currentRole === 'admin' ? (
                <Button
                  size="sm"
                  variant="ghost"
                  title="Remove Notice"
                  onClick={() => deleteAnnouncement(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                </Button>
              ) : null}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 light:border-slate-200 flex items-center justify-between text-xs text-slate-400 light:text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-300 light:text-slate-800">{item.authorName}</span>
                <span className="text-slate-400 light:text-slate-600 text-[11px]">({item.authorRole})</span>
              </div>
              <span className="font-mono text-[11px]">
                {item.publishedAt.split('T')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Broadcast Campus Notice"
        subtitle="Publish official announcement to students, teachers, or parents"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPublishModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handlePublish}>
              Post Bulletin
            </Button>
          </div>
        }
      >
        <form onSubmit={handlePublish} className="space-y-4">
          <Input
            label="Notice Headline *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Schedule Update for Winter Science Fair"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Target Audience *"
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value as any })}
              options={[
                { value: 'all', label: 'All Campus Community' },
                { value: 'students', label: 'Students Only' },
                { value: 'teachers', label: 'Faculty & Staff Only' },
                { value: 'parents', label: 'Parents & Guardians Only' },
              ]}
            />
            <Select
              label="Priority Level *"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
              options={[
                { value: 'normal', label: 'Normal Bulletin' },
                { value: 'important', label: 'Important Notice' },
                { value: 'urgent', label: 'Urgent Alert' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 light:text-slate-700 mb-1.5">
              Notice Content *
            </label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Full announcement body and instructions..."
              className="w-full rounded-lg bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-300 text-xs p-3 text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 light:text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              className="rounded bg-slate-900 light:bg-white border-slate-800 light:border-slate-300 text-indigo-600 focus:ring-0"
            />
            <span>Pin this notice to top of board</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};
