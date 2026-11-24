export type Role =
  | 'super_admin'
  | 'admin'
  | 'principal'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'librarian'
  | 'transport_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  associatedId?: string; // e.g. studentId or teacherId
  schoolId?: string;
}

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'suspended';

export interface Guardian {
  id: string;
  name: string;
  relation: 'Father' | 'Mother' | 'Guardian';
  occupation: string;
  phone: string;
  email: string;
  address: string;
}

export interface StudentDocument {
  id: string;
  title: string;
  type: string;
  uploadedAt: string;
  verified: boolean;
  size: string;
}

export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  photoUrl: string;
  classId: string;
  sectionId: string;
  rollNumber: string;
  status: StudentStatus;
  guardian: Guardian;
  contactNumber: string;
  email: string;
  address: string;
  medicalNotes?: string;
  bloodGroup?: string;
  transportRouteId?: string;
  hostelRoomId?: string;
  documents: StudentDocument[];
  enrollmentDate: string;
  attendanceRate: number; // percentage e.g. 94.5
}

export interface Teacher {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  roleTitle: string;
  department: string;
  subjectIds: string[];
  assignedClassIds: string[];
  contactNumber: string;
  email: string;
  address: string;
  joinDate: string;
  qualification: string;
  status: 'active' | 'on_leave' | 'inactive';
  photoUrl: string;
  salary: number;
}

export interface Section {
  id: string;
  name: string; // e.g. "Section A"
  roomNumber: string;
  classTeacherId: string;
  capacity: number;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "Grade 10"
  code: string; // e.g. "G10"
  sections: Section[];
  academicYear: string;
  totalStudents?: number;
}

export interface Subject {
  id: string;
  code: string; // e.g. "MTH-101"
  name: string;
  type: 'Theory' | 'Practical' | 'Elective';
  credits: number;
  leadTeacherId: string;
  applicableClassIds: string[];
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  sectionId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  markedByTeacherId: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  sectionId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number;
  startTime: string; // "08:30"
  endTime: string; // "09:20"
  subjectId: string;
  teacherId: string;
  roomNumber: string;
}

export interface Exam {
  id: string;
  title: string; // e.g. "Mid-Term Examination 2026"
  academicTerm: 'Term 1' | 'Term 2' | 'Final';
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'published';
  targetClassIds: string[];
}

export interface ExamScheduleItem {
  id: string;
  examId: string;
  subjectId: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  maxMarks: number;
  passingMarks: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  obtainedMarks: number;
  maxMarks: number;
  grade: string;
  gpa: number;
  remarks: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  assignedDate: string;
  dueDate: string;
  totalPoints: number;
  submittedCount: number;
  totalStudents: number;
}

export type FeeCategory =
  | 'Tuition'
  | 'Transport'
  | 'Library'
  | 'Laboratory'
  | 'Examination'
  | 'Extracurricular';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'partial';

export interface PaymentTransaction {
  id: string;
  amount: number;
  date: string;
  method: 'Card' | 'Bank Transfer' | 'Cash' | 'Cheque';
  receiptNumber: string;
  recordedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  category: FeeCategory;
  description: string;
  amount: number;
  discount: number;
  lateFee: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  issueDate: string;
  transactions: PaymentTransaction[];
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  edition: string;
  copiesAvailable: number;
  totalCopies: number;
  shelfLocation: string;
}

export interface BookLoan {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'borrowed' | 'returned' | 'overdue';
}

export interface TransportRoute {
  id: string;
  routeName: string;
  routeCode: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: number;
  enrolledStudents: number;
  driverName: string;
  driverPhone: string;
  stops: { stopName: string; pickupTime: string; dropTime: string }[];
  status: 'on_schedule' | 'delayed' | 'maintenance';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  targetClassId?: string;
  priority: 'normal' | 'important' | 'urgent';
  authorName: string;
  authorRole: string;
  publishedAt: string;
  pinned: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'fee' | 'attendance' | 'exam' | 'general' | 'assignment';
  linkTo?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorName: string;
  actorRole: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

export interface SchoolSettings {
  schoolName: string;
  tagline: string;
  affiliationNumber: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  principalName: string;
  currentAcademicYear: string;
  currencySymbol: string;
  gradingScale: {
    grade: string;
    minPercentage: number;
    maxPercentage: number;
    gpa: number;
    description: string;
  }[];
}
