import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Teacher } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Input } from '../components/common/Input.tsx';
import { Select } from '../components/common/Select.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Users, Search, Plus, Mail, Phone, BookOpen, GraduationCap, Award } from 'lucide-react';

export const TeachersPage: React.FC = () => {
  const { teachers, subjects, classes, addTeacher } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTeacher, setNewTeacher] = useState({
    firstName: '',
    lastName: '',
    employeeId: 'EMP-' + Math.floor(700 + Math.random() * 200),
    roleTitle: 'Faculty Instructor',
    department: 'Natural Sciences',
    contactNumber: '+1 (555) 000-0000',
    email: '',
    address: 'Pasadena, CA',
    qualification: 'M.Sc. Education',
    joinDate: new Date().toISOString().split('T')[0],
    salary: 75000,
    status: 'active' as const,
    photoUrl: '',
    subjectIds: [] as string[],
    assignedClassIds: [] as string[],
  });

  const departments = Array.from(new Set(teachers.map((t) => t.department)));

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || t.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.firstName || !newTeacher.lastName) return;

    addTeacher({
      ...newTeacher,
      email: newTeacher.email || `${newTeacher.firstName.toLowerCase()}.${newTeacher.lastName.toLowerCase()}@staugustine.edu`,
      subjectIds: [subjects[0]?.id || 'sub_math'],
      assignedClassIds: ['cls_10'],
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Faculty & Staff Directory
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Certified educators, department leadership, qualifications, and class assignments.
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Register Faculty
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="glass-card rounded-xl p-4 border border-slate-800/80 light:border-slate-200 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by faculty name, employee ID, or role..."
            className="w-full bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-200 light:text-slate-800 focus:outline-none"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher) => {
          const teacherSubjects = subjects.filter((s) => teacher.subjectIds.includes(s.id));

          return (
            <div
              key={teacher.id}
              className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200 flex flex-col justify-between hover:border-slate-700 light:hover:border-slate-300 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 light:bg-indigo-100 light:text-indigo-700 border border-indigo-500/30 light:border-indigo-200 flex items-center justify-center font-bold text-base uppercase shrink-0">
                      {teacher.firstName[0]}{teacher.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      <p className="text-xs text-indigo-400 light:text-indigo-600 font-medium">{teacher.roleTitle}</p>
                    </div>
                  </div>
                  <Badge variant={teacher.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {teacher.status}
                  </Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 light:border-slate-200 space-y-2 text-xs text-slate-400 light:text-slate-600">
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400 light:text-slate-600">Department:</span>
                    <strong className="text-slate-300 light:text-slate-900 font-medium">{teacher.department}</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400 light:text-slate-600">Degree:</span>
                    <span className="truncate text-slate-300 light:text-slate-800">{teacher.qualification}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400 light:text-slate-600">ID:</span>
                    <span className="font-mono text-slate-300 light:text-slate-900">{teacher.employeeId}</span>
                  </p>
                </div>

                {/* Assigned Subjects */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {teacherSubjects.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 light:border-slate-200 flex items-center justify-between text-xs text-slate-400 light:text-slate-600">
                <span className="truncate">{teacher.email}</span>
                <span className="font-mono shrink-0 ml-2">{teacher.contactNumber}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Faculty Educator"
        subtitle="Add a certified instructor or department staff record"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateTeacher}>
              Register Member
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={newTeacher.firstName}
              onChange={(e) => setNewTeacher({ ...newTeacher, firstName: e.target.value })}
              placeholder="e.g. Julian"
            />
            <Input
              label="Last Name *"
              value={newTeacher.lastName}
              onChange={(e) => setNewTeacher({ ...newTeacher, lastName: e.target.value })}
              placeholder="e.g. Sterling"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee ID *"
              value={newTeacher.employeeId}
              onChange={(e) => setNewTeacher({ ...newTeacher, employeeId: e.target.value })}
            />
            <Select
              label="Department *"
              value={newTeacher.department}
              onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
              options={[
                { value: 'Natural Sciences', label: 'Natural Sciences' },
                { value: 'Mathematics & Computing', label: 'Mathematics & Computing' },
                { value: 'Humanities & Languages', label: 'Humanities & Languages' },
                { value: 'Arts & Physical Education', label: 'Arts & Physical Education' },
              ]}
            />
          </div>

          <Input
            label="Designation / Role Title *"
            value={newTeacher.roleTitle}
            onChange={(e) => setNewTeacher({ ...newTeacher, roleTitle: e.target.value })}
            placeholder="e.g. Senior Chemistry Instructor"
          />

          <Input
            label="Academic Credentials & Degree"
            value={newTeacher.qualification}
            onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
            placeholder="e.g. Ph.D. Applied Mathematics, UCLA"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              value={newTeacher.contactNumber}
              onChange={(e) => setNewTeacher({ ...newTeacher, contactNumber: e.target.value })}
            />
            <Input
              label="Annual Salary Base ($)"
              type="number"
              value={newTeacher.salary}
              onChange={(e) => setNewTeacher({ ...newTeacher, salary: Number(e.target.value) })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
