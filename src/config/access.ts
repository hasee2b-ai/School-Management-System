import { Role } from '../types/index.ts';

export const ALL_ROLES: Role[] = [
  'super_admin',
  'admin',
  'principal',
  'teacher',
  'student',
  'parent',
  'accountant',
  'librarian',
  'transport_manager',
];

// Single source of truth for sidebar visibility and route guards.
// Role lists mirror the original Sidebar navItems exactly; labels/icons stay in the Sidebar.
export const ROUTE_ACCESS: Record<string, Role[]> = {
  '/': ALL_ROLES,
  '/students': ['super_admin', 'admin', 'principal', 'teacher'],
  '/teachers': ['super_admin', 'admin', 'principal'],
  '/classes': ['super_admin', 'admin', 'principal', 'teacher'],
  '/subjects': ['super_admin', 'admin', 'principal'],
  '/attendance': ['super_admin', 'admin', 'principal', 'teacher', 'student', 'parent'],
  '/timetable': ALL_ROLES,
  '/exams': ['super_admin', 'admin', 'principal', 'teacher', 'student', 'parent'],
  '/assignments': ['super_admin', 'admin', 'principal', 'teacher', 'student'],
  '/fees': ['super_admin', 'admin', 'principal', 'accountant', 'student', 'parent'],
  '/library': ['super_admin', 'admin', 'principal', 'librarian', 'teacher', 'student'],
  '/transport': ['super_admin', 'admin', 'principal', 'transport_manager', 'parent', 'student'],
  '/communication': ALL_ROLES,
  '/reports': ['super_admin', 'admin', 'principal', 'accountant'],
  '/settings': ['super_admin', 'admin', 'principal'],
};
