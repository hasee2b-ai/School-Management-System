import { describe, expect, it } from 'vitest';
import {
  calculateGrade,
  calculateReportCardSummary,
  calculateAttendancePercentage,
  getAttendanceHealth,
  calculateFeeMetrics,
  detectTimetableConflict,
} from './academicCalculations.ts';

describe('academicCalculations', () => {
  it('calculateGrade returns appropriate grades and GPAs', () => {
    expect(calculateGrade(95)).toEqual({ grade: 'A+', gpa: 4.0, remarks: 'Outstanding' });
    expect(calculateGrade(85)).toEqual({ grade: 'A', gpa: 3.7, remarks: 'Excellent' });
    expect(calculateGrade(72)).toEqual({ grade: 'B', gpa: 3.0, remarks: 'Very Good' });
    expect(calculateGrade(64)).toEqual({ grade: 'C', gpa: 2.3, remarks: 'Satisfactory' });
    expect(calculateGrade(55)).toEqual({ grade: 'D', gpa: 1.5, remarks: 'Needs Improvement' });
    expect(calculateGrade(40)).toEqual({ grade: 'F', gpa: 0.0, remarks: 'Failing' });
  });

  it('calculateReportCardSummary calculates correct totals and passing status', () => {
    const scores = [
      { subjectName: 'Mathematics', obtainedMarks: 90, maxMarks: 100 },
      { subjectName: 'Physics', obtainedMarks: 80, maxMarks: 100 },
      { subjectName: 'Literature', obtainedMarks: 85, maxMarks: 100 },
    ];
    const summary = calculateReportCardSummary(scores, 50);

    expect(summary.totalObtained).toBe(255);
    expect(summary.totalMax).toBe(300);
    expect(summary.percentage).toBe(85);
    expect(summary.isPassed).toBe(true);
    expect(summary.overallGrade).toBe('A');
  });

  it('calculateReportCardSummary fails if any subject is below passing threshold', () => {
    const scores = [
      { subjectName: 'Mathematics', obtainedMarks: 95, maxMarks: 100 },
      { subjectName: 'Chemistry', obtainedMarks: 35, maxMarks: 100 }, // failed
    ];
    const summary = calculateReportCardSummary(scores, 50);
    expect(summary.isPassed).toBe(false);
  });

  it('calculateAttendancePercentage calculates correct percentage and health status', () => {
    const pct = calculateAttendancePercentage(180, 200);
    expect(pct).toBe(90.0);
    expect(getAttendanceHealth(pct)).toBe('good');
    expect(getAttendanceHealth(78)).toBe('warning');
    expect(getAttendanceHealth(65)).toBe('critical');
  });

  it('calculateFeeMetrics computes total billed, collected, outstanding and collection rate', () => {
    const invoices = [
      { totalAmount: 1200, paidAmount: 1200 },
      { totalAmount: 1000, paidAmount: 500 },
      { totalAmount: 800, paidAmount: 0 },
    ];
    const metrics = calculateFeeMetrics(invoices);
    expect(metrics.totalBilled).toBe(3000);
    expect(metrics.totalCollected).toBe(1700);
    expect(metrics.totalOutstanding).toBe(1300);
    expect(metrics.collectionRate).toBe(56.7);
  });

  it('detectTimetableConflict identifies duplicate teacher or room bookings', () => {
    const existing = [
      { dayOfWeek: 'Monday', periodNumber: 2, teacherId: 'T101', roomNumber: 'Lab-A' },
    ];

    const teacherConflict = detectTimetableConflict(existing, {
      dayOfWeek: 'Monday',
      periodNumber: 2,
      teacherId: 'T101',
      roomNumber: 'Room-302',
    });
    expect(teacherConflict.hasConflict).toBe(true);

    const roomConflict = detectTimetableConflict(existing, {
      dayOfWeek: 'Monday',
      periodNumber: 2,
      teacherId: 'T102',
      roomNumber: 'Lab-A',
    });
    expect(roomConflict.hasConflict).toBe(true);

    const clearSlot = detectTimetableConflict(existing, {
      dayOfWeek: 'Tuesday',
      periodNumber: 2,
      teacherId: 'T101',
      roomNumber: 'Room-302',
    });
    expect(clearSlot.hasConflict).toBe(false);
  });
});
