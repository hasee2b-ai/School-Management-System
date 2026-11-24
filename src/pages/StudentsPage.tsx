import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Student, StudentStatus } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Input } from '../components/common/Input.tsx';
import { Select } from '../components/common/Select.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { EmptyState } from '../components/common/EmptyState.tsx';
import {
  GraduationCap,
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  Edit,
  IdCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  HeartPulse,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { students, classes, addStudent, updateStudent, deleteStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);

  // Add Student Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    admissionNumber: '',
    gender: 'Male' as const,
    dateOfBirth: '2010-01-01',
    classId: 'cls_10',
    sectionId: 'sec_10a',
    rollNumber: '',
    status: 'active' as StudentStatus,
    contactNumber: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    medicalNotes: '',
    guardianName: '',
    guardianRelation: 'Father' as const,
    guardianPhone: '',
    guardianEmail: '',
    guardianOccupation: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getClassName = (classId: string, sectionId?: string) => {
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return 'Class N/A';
    const sec = cls.sections.find((s) => s.id === sectionId);
    return sec ? `${cls.name} (${sec.name})` : cls.name;
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.admissionNumber.trim()) errors.admissionNumber = 'Admission number is required';
    if (!formData.rollNumber.trim()) errors.rollNumber = 'Roll number is required';
    if (!formData.guardianName.trim()) errors.guardianName = 'Guardian name is required';
    if (!formData.guardianPhone.trim()) errors.guardianPhone = 'Guardian phone is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addStudent({
      firstName: formData.firstName,
      lastName: formData.lastName,
      admissionNumber: formData.admissionNumber,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      photoUrl: '',
      classId: formData.classId,
      sectionId: formData.sectionId,
      rollNumber: formData.rollNumber,
      status: formData.status,
      contactNumber: formData.contactNumber || formData.guardianPhone,
      email: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@student.staugustine.edu`,
      address: formData.address,
      bloodGroup: formData.bloodGroup,
      medicalNotes: formData.medicalNotes,
      enrollmentDate: new Date().toISOString().split('T')[0],
      guardian: {
        id: 'grd_' + Date.now(),
        name: formData.guardianName,
        relation: formData.guardianRelation,
        phone: formData.guardianPhone,
        email: formData.guardianEmail,
        occupation: formData.guardianOccupation,
        address: formData.address,
      },
    });

    setIsAddModalOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      admissionNumber: '',
      gender: 'Male',
      dateOfBirth: '2010-01-01',
      classId: 'cls_10',
      sectionId: 'sec_10a',
      rollNumber: '',
      status: 'active',
      contactNumber: '',
      email: '',
      address: '',
      bloodGroup: 'O+',
      medicalNotes: '',
      guardianName: '',
      guardianRelation: 'Father',
      guardianPhone: '',
      guardianEmail: '',
      guardianOccupation: '',
    });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Student Information & Registry
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Manage academic profiles, guardians, attendance records, and student credentials.
          </p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              admissionNumber: 'ADM-2026-' + Math.floor(1000 + Math.random() * 9000),
              rollNumber: '10-A-' + Math.floor(10 + Math.random() * 80),
            }));
            setIsAddModalOpen(true);
          }}
        >
          Enroll Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-xl p-4 border border-slate-800/80 light:border-slate-200 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or admission number..."
            className="w-full bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-200 light:text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-200 light:text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Students Data Grid / Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-8 h-8" />}
          title="No Students Found"
          description="Try modifying your search keywords or class filters, or register a new student."
          actionLabel="Enroll First Student"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="glass-card rounded-xl border border-slate-800/80 light:border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 light:border-slate-200 bg-slate-900/40 light:bg-slate-100/60 text-[11px] font-semibold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 light:divide-slate-200/70 text-xs">
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-800/40 light:hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 light:bg-indigo-100 light:text-indigo-700 border border-indigo-500/30 light:border-indigo-200 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100 light:text-slate-900">
                            {s.firstName} {s.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400 light:text-slate-600">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 light:text-slate-700">
                      {s.admissionNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 light:text-slate-800">
                      {getClassName(s.classId, s.sectionId)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 light:text-slate-700">
                      {s.rollNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-200 light:text-slate-800 font-medium">
                        {s.guardian?.name}
                      </p>
                      <p className="text-[11px] text-slate-400 light:text-slate-600 font-mono">
                        {s.guardian?.phone}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`font-semibold ${
                          s.attendanceRate >= 85
                            ? 'text-emerald-400 light:text-emerald-700'
                            : s.attendanceRate >= 75
                            ? 'text-amber-400 light:text-amber-700'
                            : 'text-rose-400 light:text-rose-700'
                        }`}
                      >
                        {s.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          s.status === 'active'
                            ? 'success'
                            : s.status === 'suspended'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          title="View Profile"
                          onClick={() => setSelectedStudent(s)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="View ID Card"
                          onClick={() => {
                            setSelectedStudent(s);
                            setIsIdCardOpen(true);
                          }}
                        >
                          <IdCard className="w-3.5 h-3.5 text-indigo-400 light:text-indigo-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Delete Record"
                          onClick={() => deleteStudent(s.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400 light:text-rose-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Profile Detail Modal */}
      {selectedStudent && !isIdCardOpen && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Profile: ${selectedStudent.firstName} ${selectedStudent.lastName}`}
          subtitle={`Admission No: ${selectedStudent.admissionNumber} · Enrolled ${selectedStudent.enrollmentDate}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                icon={<IdCard className="w-4 h-4" />}
                onClick={() => setIsIdCardOpen(true)}
              >
                Print Student ID Card
              </Button>
              <Button size="sm" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Top Identity Block */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200">
              <div className="w-16 h-16 rounded-xl bg-indigo-600/20 text-indigo-400 light:bg-indigo-100 light:text-indigo-700 border border-indigo-500/30 light:border-indigo-200 flex items-center justify-center font-bold text-xl uppercase shrink-0">
                {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100 light:text-slate-900">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h4>
                <p className="text-xs text-slate-400 light:text-slate-600">
                  {getClassName(selectedStudent.classId, selectedStudent.sectionId)} · Roll #{selectedStudent.rollNumber}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="success" size="sm">{selectedStudent.status}</Badge>
                  <span className="text-xs text-slate-400 light:text-slate-600">
                    Blood Group: <strong className="text-slate-200 light:text-slate-900">{selectedStudent.bloodGroup || 'N/A'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Personal & Medical */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/40 light:bg-slate-50 border border-slate-800/60 light:border-slate-200">
                <p className="font-semibold text-slate-300 light:text-slate-800 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-400 light:text-rose-600" />
                  Health & Contact Details
                </p>
                <div className="space-y-1.5 text-slate-300 light:text-slate-700">
                  <p><span className="text-slate-400 light:text-slate-600">Date of Birth:</span> {selectedStudent.dateOfBirth}</p>
                  <p><span className="text-slate-400 light:text-slate-600">Gender:</span> {selectedStudent.gender}</p>
                  <p><span className="text-slate-400 light:text-slate-600">Email:</span> {selectedStudent.email}</p>
                  <p><span className="text-slate-400 light:text-slate-600">Phone:</span> {selectedStudent.contactNumber}</p>
                  <p><span className="text-slate-400 light:text-slate-600">Address:</span> {selectedStudent.address}</p>
                  <p><span className="text-slate-400 light:text-slate-600">Medical Notes:</span> {selectedStudent.medicalNotes || 'No specific restrictions noted'}</p>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/40 light:bg-slate-50 border border-slate-800/60 light:border-slate-200">
                <p className="font-semibold text-slate-300 light:text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 light:text-indigo-600" />
                  Primary Guardian Information
                </p>
                <div className="space-y-1.5 text-slate-300 light:text-slate-700">
                  <p><span className="text-slate-400 light:text-slate-600">Name:</span> {selectedStudent.guardian?.name}</p>
                  <p><span className="text-slate-400 light:text-slate-600">Relation:</span> {selectedStudent.guardian?.relation}</p>
                  <p><span className="text-slate-400 light:text-slate-600">Occupation:</span> {selectedStudent.guardian?.occupation || 'Guardian'}</p>
                  <p><span className="text-slate-400 light:text-slate-600">Phone:</span> {selectedStudent.guardian?.phone}</p>
                  <p><span className="text-slate-400 light:text-slate-600">Email:</span> {selectedStudent.guardian?.email}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <p className="text-xs font-semibold text-slate-300 light:text-slate-800 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400 light:text-slate-600" />
                Verified Admissions Documents ({selectedStudent.documents?.length || 0})
              </p>
              {selectedStudent.documents && selectedStudent.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedStudent.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-lg bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium text-slate-200 light:text-slate-900">{doc.title}</p>
                        <p className="text-[10px] text-slate-400 light:text-slate-600 font-mono">{doc.type} · {doc.size}</p>
                      </div>
                      <Badge variant="success" size="sm">Verified</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 light:text-slate-600 italic">No uploaded documents on file.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Student ID Card Modal */}
      {selectedStudent && isIdCardOpen && (
        <Modal
          isOpen={isIdCardOpen}
          onClose={() => setIsIdCardOpen(false)}
          title="Student Official Credential Card"
          subtitle="Printable High-Security ID Card"
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.print();
                }}
              >
                Print Badge
              </Button>
              <Button size="sm" onClick={() => setIsIdCardOpen(false)}>
                Done
              </Button>
            </div>
          }
        >
          <div className="flex justify-center p-4">
            <div className="w-80 rounded-2xl bg-slate-950 border border-indigo-500/40 light:border-slate-300 p-6 shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
              {/* Header */}
              <div className="text-center pb-4 border-b border-slate-800">
                <p className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                  St. Augustine International Academy
                </p>
                <p className="text-[9px] text-slate-400">STUDENT IDENTIFICATION CARD</p>
              </div>

              {/* Avatar & Name */}
              <div className="flex flex-col items-center mt-5">
                <div className="w-20 h-20 rounded-xl bg-indigo-600/30 text-indigo-300 border-2 border-indigo-400 flex items-center justify-center font-bold text-2xl uppercase shadow-lg">
                  {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-100 tracking-tight">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-xs text-indigo-400 font-mono font-medium">
                  {selectedStudent.admissionNumber}
                </p>
              </div>

              {/* Specs */}
              <div className="mt-5 space-y-1.5 text-xs border-t border-slate-800 pt-3 text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Class:</span>
                  <span>{getClassName(selectedStudent.classId, selectedStudent.sectionId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Roll No:</span>
                  <span>{selectedStudent.rollNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valid Through:</span>
                  <span>June 2027</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Emergency Phone:</span>
                  <span>{selectedStudent.guardian?.phone}</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="mt-6 pt-3 border-t border-slate-800 flex flex-col items-center">
                <div className="h-7 w-48 bg-slate-800 rounded flex items-center justify-around px-2 font-mono text-[9px] text-slate-400">
                  || | ||| || ||| | || ||| || ||
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-1">
                  SEC-AUTH-2026-9980
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Student Admission & Enrollment Form"
        subtitle="Register a new academic entrant into the central database"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEnrollSubmit}>
              Complete Enrollment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={formErrors.firstName}
              placeholder="e.g. Nicholas"
            />
            <Input
              label="Last Name *"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={formErrors.lastName}
              placeholder="e.g. Sterling"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Admission Number *"
              value={formData.admissionNumber}
              onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
              error={formErrors.admissionNumber}
            />
            <Select
              label="Class *"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Input
              label="Roll Number *"
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              error={formErrors.rollNumber}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            <Input
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              placeholder="e.g. A+"
            />
          </div>

          <div className="border-t border-slate-800 light:border-slate-200 pt-3">
            <p className="text-xs font-semibold text-slate-300 light:text-slate-800 mb-3">
              Guardian Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Guardian Full Name *"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                error={formErrors.guardianName}
                placeholder="e.g. Elizabeth Sterling"
              />
              <Select
                label="Relation"
                value={formData.guardianRelation}
                onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value as any })}
                options={[
                  { value: 'Father', label: 'Father' },
                  { value: 'Mother', label: 'Mother' },
                  { value: 'Guardian', label: 'Legal Guardian' },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <Input
                label="Guardian Phone *"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                error={formErrors.guardianPhone}
                placeholder="+1 (555) 000-0000"
              />
              <Input
                label="Guardian Email"
                type="email"
                value={formData.guardianEmail}
                onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                placeholder="guardian@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Input
              label="Residential Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full street address, city, state and zip"
            />
            <Input
              label="Medical & Dietary Notes"
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              placeholder="Allergies, inhaler requirements, or physical education waivers"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
