import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Teacher,
  ClassRoom,
  Subject,
  AttendanceRecord,
  TimetableEntry,
  Exam,
  ExamResult,
  Assignment,
  Invoice,
  Book,
  BookLoan,
  TransportRoute,
  Announcement,
  NotificationItem,
  SchoolSettings,
} from '../types/index.ts';
import { StorageService } from '../services/storage.ts';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  // Theme & Global filters
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;

  // Data states
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  timetable: TimetableEntry[];
  exams: Exam[];
  results: ExamResult[];
  assignments: Assignment[];
  invoices: Invoice[];
  books: Book[];
  loans: BookLoan[];
  routes: TransportRoute[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  settings: SchoolSettings;

  // Action methods
  addStudent: (student: Omit<Student, 'id' | 'documents' | 'attendanceRate'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  markAttendanceForClass: (
    classId: string,
    sectionId: string,
    date: string,
    records: { studentId: string; status: AttendanceRecord['status']; remarks?: string }[],
    teacherId: string
  ) => void;

  addAssignment: (assignment: Omit<Assignment, 'id' | 'submittedCount'>) => void;

  addInvoice: (invoice: Omit<Invoice, 'id' | 'paidAmount' | 'status' | 'transactions'>) => void;
  recordPayment: (
    invoiceId: string,
    amount: number,
    method: 'Card' | 'Bank Transfer' | 'Cash' | 'Cheque',
    recordedBy: string
  ) => void;

  addBook: (book: Omit<Book, 'id'>) => void;
  issueBook: (bookId: string, studentId: string, dueDate: string) => void;
  returnBook: (loanId: string) => void;

  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'publishedAt'>) => void;
  deleteAnnouncement: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  updateSettings: (updates: Partial<SchoolSettings>) => void;
  resetToDemoDefaults: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('smc_theme');
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [academicYear, setAcademicYear] = useState<string>('2026-2027');

  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(() => StorageService.getTeachers());
  const [classes, setClasses] = useState<ClassRoom[]>(() => StorageService.getClasses());
  const [subjects, setSubjects] = useState<Subject[]>(() => StorageService.getSubjects());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => StorageService.getTimetable());
  const [exams, setExams] = useState<Exam[]>(() => StorageService.getExams());
  const [results, setResults] = useState<ExamResult[]>(() => StorageService.getResults());
  const [assignments, setAssignments] = useState<Assignment[]>(() => StorageService.getAssignments());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [books, setBooks] = useState<Book[]>(() => StorageService.getBooks());
  const [loans, setLoans] = useState<BookLoan[]>(() => StorageService.getLoans());
  const [routes, setRoutes] = useState<TransportRoute[]>(() => StorageService.getRoutes());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => StorageService.getAnnouncements());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());
  const [settings, setSettings] = useState<SchoolSettings>(() => StorageService.getSettings());

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply theme class to document
  useEffect(() => {
    localStorage.setItem('smc_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Student Actions
  const addStudent = (studentData: Omit<Student, 'id' | 'documents' | 'attendanceRate'>) => {
    const newStudent: Student = {
      ...studentData,
      id: 'stu_' + Date.now(),
      documents: [],
      attendanceRate: 100.0,
    };
    const updated = [newStudent, ...students];
    setStudents(updated);
    StorageService.saveStudents(updated);
    addToast({ type: 'success', title: 'Student Enrolled', message: `${newStudent.firstName} ${newStudent.lastName} successfully registered.` });
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const updated = students.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStudents(updated);
    StorageService.saveStudents(updated);
    addToast({ type: 'success', title: 'Student Updated', message: 'Student profile record updated.' });
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    StorageService.saveStudents(updated);
    addToast({ type: 'info', title: 'Student Record Removed', message: `${target?.firstName || 'Student'} was removed.` });
  };

  // Teacher Actions
  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: 'tch_' + Date.now(),
    };
    const updated = [newTeacher, ...teachers];
    setTeachers(updated);
    StorageService.saveTeachers(updated);
    addToast({ type: 'success', title: 'Staff Member Added', message: `${newTeacher.firstName} ${newTeacher.lastName} registered.` });
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    const updated = teachers.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTeachers(updated);
    StorageService.saveTeachers(updated);
    addToast({ type: 'success', title: 'Staff Record Updated', message: 'Teacher details updated.' });
  };

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    StorageService.saveTeachers(updated);
    addToast({ type: 'info', title: 'Staff Member Removed' });
  };

  // Attendance
  const markAttendanceForClass = (
    classId: string,
    sectionId: string,
    date: string,
    records: { studentId: string; status: AttendanceRecord['status']; remarks?: string }[],
    teacherId: string
  ) => {
    // Remove existing records for this class, section, date
    const remaining = attendance.filter(
      (a) => !(a.classId === classId && a.sectionId === sectionId && a.date === date)
    );
    const newRecords: AttendanceRecord[] = records.map((r) => ({
      id: 'att_' + Date.now() + '_' + r.studentId,
      studentId: r.studentId,
      classId,
      sectionId,
      date,
      status: r.status,
      remarks: r.remarks,
      markedByTeacherId: teacherId,
    }));
    const updated = [...newRecords, ...remaining];
    setAttendance(updated);
    StorageService.saveAttendance(updated);

    // Update student attendance rate averages
    const presentCount = records.filter((r) => r.status === 'present').length;
    addToast({
      type: 'success',
      title: 'Attendance Saved',
      message: `Recorded ${records.length} students (${presentCount} present).`,
    });
  };

  // Assignments
  const addAssignment = (data: Omit<Assignment, 'id' | 'submittedCount'>) => {
    const newAsg: Assignment = {
      ...data,
      id: 'asg_' + Date.now(),
      submittedCount: 0,
    };
    const updated = [newAsg, ...assignments];
    setAssignments(updated);
    StorageService.saveAssignments(updated);
    addToast({ type: 'success', title: 'Assignment Published', message: data.title });
  };

  // Invoices & Payments
  const addInvoice = (data: Omit<Invoice, 'id' | 'paidAmount' | 'status' | 'transactions'>) => {
    const newInv: Invoice = {
      ...data,
      id: 'inv_' + Date.now(),
      paidAmount: 0,
      status: 'pending',
      transactions: [],
    };
    const updated = [newInv, ...invoices];
    setInvoices(updated);
    StorageService.saveInvoices(updated);
    addToast({ type: 'success', title: 'Fee Invoice Generated', message: `Invoice #${newInv.invoiceNumber} created.` });
  };

  const recordPayment = (
    invoiceId: string,
    amount: number,
    method: 'Card' | 'Bank Transfer' | 'Cash' | 'Cheque',
    recordedBy: string
  ) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        const newPaid = inv.paidAmount + amount;
        const newStatus: Invoice['status'] =
          newPaid >= inv.totalAmount ? 'paid' : newPaid > 0 ? 'partial' : inv.status;
        const txn = {
          id: 'txn_' + Date.now(),
          amount,
          date: new Date().toISOString().split('T')[0],
          method,
          receiptNumber: 'REC-' + Math.floor(100000 + Math.random() * 900000),
          recordedBy,
        };
        return {
          ...inv,
          paidAmount: newPaid,
          status: newStatus,
          transactions: [txn, ...inv.transactions],
        };
      }
      return inv;
    });

    setInvoices(updated);
    StorageService.saveInvoices(updated);
    addToast({ type: 'success', title: 'Payment Recorded', message: `$${amount} credited successfully.` });
  };

  // Library
  const addBook = (bookData: Omit<Book, 'id'>) => {
    const newBook: Book = { ...bookData, id: 'bk_' + Date.now() };
    const updated = [newBook, ...books];
    setBooks(updated);
    StorageService.saveBooks(updated);
    addToast({ type: 'success', title: 'Book Added to Catalog', message: bookData.title });
  };

  const issueBook = (bookId: string, studentId: string, dueDate: string) => {
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook || targetBook.copiesAvailable <= 0) {
      addToast({ type: 'error', title: 'Cannot Issue Book', message: 'No copies available right now.' });
      return;
    }

    const newLoan: BookLoan = {
      id: 'loan_' + Date.now(),
      bookId,
      studentId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      fineAmount: 0,
      status: 'borrowed',
    };

    const updatedLoans = [newLoan, ...loans];
    const updatedBooks = books.map((b) =>
      b.id === bookId ? { ...b, copiesAvailable: b.copiesAvailable - 1 } : b
    );

    setLoans(updatedLoans);
    setBooks(updatedBooks);
    StorageService.saveLoans(updatedLoans);
    StorageService.saveBooks(updatedBooks);
    addToast({ type: 'success', title: 'Book Issued', message: `Loan registered for "${targetBook.title}"` });
  };

  const returnBook = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedLoans = loans.map((l) =>
      l.id === loanId ? { ...l, status: 'returned' as const, returnDate: today } : l
    );

    const updatedBooks = books.map((b) =>
      b.id === targetLoan.bookId ? { ...b, copiesAvailable: b.copiesAvailable + 1 } : b
    );

    setLoans(updatedLoans);
    setBooks(updatedBooks);
    StorageService.saveLoans(updatedLoans);
    StorageService.saveBooks(updatedBooks);
    addToast({ type: 'success', title: 'Book Returned', message: 'Item checked in to catalog.' });
  };

  // Announcements
  const addAnnouncement = (data: Omit<Announcement, 'id' | 'publishedAt'>) => {
    const newAnc: Announcement = {
      ...data,
      id: 'anc_' + Date.now(),
      publishedAt: new Date().toISOString(),
    };
    const updated = [newAnc, ...announcements];
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);
    addToast({ type: 'success', title: 'Announcement Published', message: data.title });
  };

  const deleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);
    addToast({ type: 'info', title: 'Notice Removed' });
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
    addToast({ type: 'info', title: 'All Notifications Cleared' });
  };

  // Settings
  const updateSettings = (updates: Partial<SchoolSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    StorageService.saveSettings(updated);
    addToast({ type: 'success', title: 'Settings Saved', message: 'Institution preferences updated.' });
  };

  const resetToDemoDefaults = () => {
    StorageService.resetAllToDemo();
    setStudents(StorageService.getStudents());
    setTeachers(StorageService.getTeachers());
    setClasses(StorageService.getClasses());
    setSubjects(StorageService.getSubjects());
    setAttendance(StorageService.getAttendance());
    setTimetable(StorageService.getTimetable());
    setExams(StorageService.getExams());
    setResults(StorageService.getResults());
    setAssignments(StorageService.getAssignments());
    setInvoices(StorageService.getInvoices());
    setBooks(StorageService.getBooks());
    setLoans(StorageService.getLoans());
    setRoutes(StorageService.getRoutes());
    setAnnouncements(StorageService.getAnnouncements());
    setNotifications(StorageService.getNotifications());
    setSettings(StorageService.getSettings());
    addToast({ type: 'info', title: 'Demo State Reset', message: 'Restored original mock database.' });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        academicYear,
        setAcademicYear,
        students,
        teachers,
        classes,
        subjects,
        attendance,
        timetable,
        exams,
        results,
        assignments,
        invoices,
        books,
        loans,
        routes,
        announcements,
        notifications,
        settings,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        markAttendanceForClass,
        addAssignment,
        addInvoice,
        recordPayment,
        addBook,
        issueBook,
        returnBook,
        addAnnouncement,
        deleteAnnouncement,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        resetToDemoDefaults,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
