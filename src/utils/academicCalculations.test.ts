import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGrade,
  calculateReportCardSummary,
  calculateAttendancePercentage,
  getAttendanceHealth,
  calculateFeeMetrics,
  detectTimetableConflict,
} from './academicCalculations.ts';

test('calculateGrade returns appropriate grades and GPAs', () => {
  assert.deepEqual(calculateGrade(95), { grade: 'A+', gpa: 4.0, remarks: 'Outstanding' });
  assert.deepEqual(calculateGrade(85), { grade: 'A', gpa: 3.7, remarks: 'Excellent' });
  assert.deepEqual(calculateGrade(72), { grade: 'B', gpa: 3.0, remarks: 'Very Good' });
  assert.deepEqual(calculateGrade(64), { grade: 'C', gpa: 2.3, remarks: 'Satisfactory' });
  assert.deepEqual(calculateGrade(55), { grade: 'D', gpa: 1.5, remarks: 'Needs Improvement' });
  assert.deepEqual(calculateGrade(40), { grade: 'F', gpa: 0.0, remarks: 'Failing' });
});

test('calculateReportCardSummary calculates correct totals and passing status', () => {
  const scores = [
    { subjectName: 'Mathematics', obtainedMarks: 90, maxMarks: 100 },
    { subjectName: 'Physics', obtainedMarks: 80, maxMarks: 100 },
    { subjectName: 'Literature', obtainedMarks: 85, maxMarks: 100 },
  ];
  const summary = calculateReportCardSummary(scores, 50);

  assert.equal(summary.totalObtained, 255);
  assert.equal(summary.totalMax, 300);
  assert.equal(summary.percentage, 85);
  assert.equal(summary.isPassed, true);
  assert.equal(summary.overallGrade, 'A');
});

test('calculateReportCardSummary fails if any subject is below passing threshold', () => {
  const scores = [
    { subjectName: 'Mathematics', obtainedMarks: 95, maxMarks: 100 },
    { subjectName: 'Chemistry', obtainedMarks: 35, maxMarks: 100 }, // failed
  ];
  const summary = calculateReportCardSummary(scores, 50);
  assert.equal(summary.isPassed, false);
});

test('calculateAttendancePercentage calculates correct percentage and health status', () => {
  const pct = calculateAttendancePercentage(180, 200);
  assert.equal(pct, 90.0);
  assert.equal(getAttendanceHealth(pct), 'good');
  assert.equal(getAttendanceHealth(78), 'warning');
  assert.equal(getAttendanceHealth(65), 'critical');
});

test('calculateFeeMetrics computes total billed, collected, outstanding and collection rate', () => {
  const invoices = [
    { totalAmount: 1200, paidAmount: 1200 },
    { totalAmount: 1000, paidAmount: 500 },
    { totalAmount: 800, paidAmount: 0 },
  ];
  const metrics = calculateFeeMetrics(invoices);
  assert.equal(metrics.totalBilled, 3000);
  assert.equal(metrics.totalCollected, 1700);
  assert.equal(metrics.totalOutstanding, 1300);
  assert.equal(metrics.collectionRate, 56.7);
});

test('detectTimetableConflict identifies duplicate teacher or room bookings', () => {
  const existing = [
    { dayOfWeek: 'Monday', periodNumber: 2, teacherId: 'T101', roomNumber: 'Lab-A' },
  ];

  const teacherConflict = detectTimetableConflict(existing, {
    dayOfWeek: 'Monday',
    periodNumber: 2,
    teacherId: 'T101',
    roomNumber: 'Room-302',
  });
  assert.equal(teacherConflict.hasConflict, true);

  const roomConflict = detectTimetableConflict(existing, {
    dayOfWeek: 'Monday',
    periodNumber: 2,
    teacherId: 'T102',
    roomNumber: 'Lab-A',
  });
  assert.equal(roomConflict.hasConflict, true);

  const clearSlot = detectTimetableConflict(existing, {
    dayOfWeek: 'Tuesday',
    periodNumber: 2,
    teacherId: 'T101',
    roomNumber: 'Lab-A',
  });
  assert.equal(clearSlot.hasConflict, false);
});
