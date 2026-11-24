export interface GradeResult {
  grade: string;
  gpa: number;
  remarks: string;
}

export function calculateGrade(percentage: number): GradeResult {
  if (percentage >= 90) {
    return { grade: 'A+', gpa: 4.0, remarks: 'Outstanding' };
  } else if (percentage >= 80) {
    return { grade: 'A', gpa: 3.7, remarks: 'Excellent' };
  } else if (percentage >= 70) {
    return { grade: 'B', gpa: 3.0, remarks: 'Very Good' };
  } else if (percentage >= 60) {
    return { grade: 'C', gpa: 2.3, remarks: 'Satisfactory' };
  } else if (percentage >= 50) {
    return { grade: 'D', gpa: 1.5, remarks: 'Needs Improvement' };
  } else {
    return { grade: 'F', gpa: 0.0, remarks: 'Failing' };
  }
}

export interface SubjectScore {
  subjectName: string;
  obtainedMarks: number;
  maxMarks: number;
}

export interface ReportCardSummary {
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGpa: number;
  overallGrade: string;
  isPassed: boolean;
}

export function calculateReportCardSummary(
  scores: SubjectScore[],
  passingPercentage: number = 50
): ReportCardSummary {
  if (scores.length === 0) {
    return {
      totalObtained: 0,
      totalMax: 0,
      percentage: 0,
      overallGpa: 0,
      overallGrade: 'N/A',
      isPassed: false,
    };
  }

  const totalObtained = scores.reduce((sum, s) => sum + s.obtainedMarks, 0);
  const totalMax = scores.reduce((sum, s) => sum + s.maxMarks, 0);
  const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;

  const individualGrades = scores.map((s) => {
    const pct = s.maxMarks > 0 ? (s.obtainedMarks / s.maxMarks) * 100 : 0;
    return calculateGrade(pct);
  });

  const avgGpa =
    individualGrades.reduce((sum, g) => sum + g.gpa, 0) / (individualGrades.length || 1);
  const roundedGpa = Math.round(avgGpa * 100) / 100;

  const overall = calculateGrade(percentage);
  const anySubjectFailed = scores.some((s) => {
    const pct = s.maxMarks > 0 ? (s.obtainedMarks / s.maxMarks) * 100 : 0;
    return pct < passingPercentage;
  });

  return {
    totalObtained,
    totalMax,
    percentage,
    overallGpa: roundedGpa,
    overallGrade: overall.grade,
    isPassed: !anySubjectFailed && percentage >= passingPercentage,
  };
}

export function calculateAttendancePercentage(
  presentDays: number,
  totalDays: number
): number {
  if (totalDays <= 0) return 0;
  return Math.round((presentDays / totalDays) * 1000) / 10;
}

export function getAttendanceHealth(rate: number): 'good' | 'warning' | 'critical' {
  if (rate >= 85) return 'good';
  if (rate >= 75) return 'warning';
  return 'critical';
}

export interface FeeSummary {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
}

export function calculateFeeMetrics(
  invoices: { totalAmount: number; paidAmount: number }[]
): FeeSummary {
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);
  const collectionRate =
    totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 1000) / 10 : 0;

  return {
    totalBilled,
    totalCollected,
    totalOutstanding,
    collectionRate,
  };
}

export interface TimetableSlot {
  dayOfWeek: string;
  periodNumber: number;
  teacherId: string;
  roomNumber: string;
}

export function detectTimetableConflict(
  existingSlots: TimetableSlot[],
  newSlot: TimetableSlot
): { hasConflict: boolean; reason?: string } {
  for (const slot of existingSlots) {
    if (
      slot.dayOfWeek === newSlot.dayOfWeek &&
      slot.periodNumber === newSlot.periodNumber
    ) {
      if (slot.teacherId === newSlot.teacherId) {
        return {
          hasConflict: true,
          reason: `Teacher is already scheduled for period ${newSlot.periodNumber} on ${newSlot.dayOfWeek}`,
        };
      }
      if (slot.roomNumber === newSlot.roomNumber) {
        return {
          hasConflict: true,
          reason: `Room ${newSlot.roomNumber} is already in use during period ${newSlot.periodNumber} on ${newSlot.dayOfWeek}`,
        };
      }
    }
  }
  return { hasConflict: false };
}
