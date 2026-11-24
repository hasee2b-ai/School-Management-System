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
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_ATTENDANCE,
  INITIAL_TIMETABLE,
  INITIAL_EXAMS,
  INITIAL_RESULTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_INVOICES,
  INITIAL_BOOKS,
  INITIAL_LOANS,
  INITIAL_ROUTES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SCHOOL_SETTINGS,
} from '../data/mockData.ts';

const PREFIX = 'smc_data_';

function getOrInit<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    if (!item) {
      localStorage.setItem(PREFIX + key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Failed reading ${key} from localStorage, using seed data`, e);
    return initial;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed saving ${key} to localStorage`, e);
  }
}

export const StorageService = {
  getStudents: (): Student[] => getOrInit('students', INITIAL_STUDENTS),
  saveStudents: (data: Student[]) => save('students', data),

  getTeachers: (): Teacher[] => getOrInit('teachers', INITIAL_TEACHERS),
  saveTeachers: (data: Teacher[]) => save('teachers', data),

  getClasses: (): ClassRoom[] => getOrInit('classes', INITIAL_CLASSES),
  saveClasses: (data: ClassRoom[]) => save('classes', data),

  getSubjects: (): Subject[] => getOrInit('subjects', INITIAL_SUBJECTS),
  saveSubjects: (data: Subject[]) => save('subjects', data),

  getAttendance: (): AttendanceRecord[] => getOrInit('attendance', INITIAL_ATTENDANCE),
  saveAttendance: (data: AttendanceRecord[]) => save('attendance', data),

  getTimetable: (): TimetableEntry[] => getOrInit('timetable', INITIAL_TIMETABLE),
  saveTimetable: (data: TimetableEntry[]) => save('timetable', data),

  getExams: (): Exam[] => getOrInit('exams', INITIAL_EXAMS),
  saveExams: (data: Exam[]) => save('exams', data),

  getResults: (): ExamResult[] => getOrInit('results', INITIAL_RESULTS),
  saveResults: (data: ExamResult[]) => save('results', data),

  getAssignments: (): Assignment[] => getOrInit('assignments', INITIAL_ASSIGNMENTS),
  saveAssignments: (data: Assignment[]) => save('assignments', data),

  getInvoices: (): Invoice[] => getOrInit('invoices', INITIAL_INVOICES),
  saveInvoices: (data: Invoice[]) => save('invoices', data),

  getBooks: (): Book[] => getOrInit('books', INITIAL_BOOKS),
  saveBooks: (data: Book[]) => save('books', data),

  getLoans: (): BookLoan[] => getOrInit('loans', INITIAL_LOANS),
  saveLoans: (data: BookLoan[]) => save('loans', data),

  getRoutes: (): TransportRoute[] => getOrInit('routes', INITIAL_ROUTES),
  saveRoutes: (data: TransportRoute[]) => save('routes', data),

  getAnnouncements: (): Announcement[] => getOrInit('announcements', INITIAL_ANNOUNCEMENTS),
  saveAnnouncements: (data: Announcement[]) => save('announcements', data),

  getNotifications: (): NotificationItem[] => getOrInit('notifications', INITIAL_NOTIFICATIONS),
  saveNotifications: (data: NotificationItem[]) => save('notifications', data),

  getSettings: (): SchoolSettings => getOrInit('settings', INITIAL_SCHOOL_SETTINGS),
  saveSettings: (data: SchoolSettings) => save('settings', data),

  resetAllToDemo: (): void => {
    save('students', INITIAL_STUDENTS);
    save('teachers', INITIAL_TEACHERS);
    save('classes', INITIAL_CLASSES);
    save('subjects', INITIAL_SUBJECTS);
    save('attendance', INITIAL_ATTENDANCE);
    save('timetable', INITIAL_TIMETABLE);
    save('exams', INITIAL_EXAMS);
    save('results', INITIAL_RESULTS);
    save('assignments', INITIAL_ASSIGNMENTS);
    save('invoices', INITIAL_INVOICES);
    save('books', INITIAL_BOOKS);
    save('loans', INITIAL_LOANS);
    save('routes', INITIAL_ROUTES);
    save('announcements', INITIAL_ANNOUNCEMENTS);
    save('notifications', INITIAL_NOTIFICATIONS);
    save('settings', INITIAL_SCHOOL_SETTINGS);
  },
};
