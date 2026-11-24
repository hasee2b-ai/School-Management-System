import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ExamResult } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Award, BookOpen, Printer, CheckCircle2, TrendingUp, Sparkles, Filter } from 'lucide-react';
import {
  calculateGrade,
  calculateReportCardSummary,
} from '../utils/academicCalculations.ts';

export const ExamsPage: React.FC = () => {
  const { exams, results, students, subjects, classes, settings } = useApp();

  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string | null>(null);

  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Group results by student for the active exam
  const studentResultsMap: Record<string, ExamResult[]> = {};
  results
    .filter((r) => r.examId === activeExam?.id)
    .forEach((r) => {
      if (!studentResultsMap[r.studentId]) {
        studentResultsMap[r.studentId] = [];
      }
      studentResultsMap[r.studentId].push(r);
    });

  // Calculate Report Card data if a student is selected
  const targetStudent = students.find((s) => s.id === selectedStudentForReport);
  const studentExamScores = selectedStudentForReport
    ? results
        .filter((r) => r.examId === activeExam?.id && r.studentId === selectedStudentForReport)
        .map((r) => {
          const subj = subjects.find((s) => s.id === r.subjectId);
          return {
            subjectName: subj?.name || 'General Subject',
            obtainedMarks: r.obtainedMarks,
            maxMarks: r.maxMarks,
            grade: r.grade,
            gpa: r.gpa,
            remarks: r.remarks,
          };
        })
    : [];

  const reportSummary = calculateReportCardSummary(studentExamScores, 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Examinations & Academic Performance
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Exam schedules, marks entry, automated GPA calculation, and official report cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-100 light:text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.academicTerm})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Banner: Exam Details */}
      <div className="glass-card rounded-xl p-5 border border-slate-800/80 light:border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" size="sm">{activeExam?.academicTerm}</Badge>
            <span className="text-xs text-slate-400 light:text-slate-500">·</span>
            <Badge variant={activeExam?.status === 'published' ? 'success' : 'neutral'} size="sm">
              {activeExam?.status}
            </Badge>
          </div>
          <h3 className="text-lg font-bold text-slate-100 light:text-slate-900">
            {activeExam?.title}
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 font-mono mt-1">
            Examination Period: {activeExam?.startDate} through {activeExam?.endDate}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-center p-3 rounded-lg bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-200">
            <span className="text-slate-400 light:text-slate-600 block text-[10px]">RESULTS RECORDED</span>
            <span className="text-base font-bold text-slate-100 light:text-slate-900">{Object.keys(studentResultsMap).length} Students</span>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-900/60 light:bg-slate-100 border border-slate-800 light:border-slate-200">
            <span className="text-slate-400 light:text-slate-600 block text-[10px]">PASS RATE</span>
            <span className="text-base font-bold text-emerald-400 light:text-emerald-700">100.0%</span>
          </div>
        </div>
      </div>

      {/* Student Results Table */}
      <div className="glass-card rounded-xl border border-slate-800/80 light:border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 light:border-slate-200 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-100 light:text-slate-900">
            Term Gradebook Roster
          </h4>
          <span className="text-xs text-slate-400 light:text-slate-600">Click any student to view official report card</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 light:border-slate-200 bg-slate-900/40 light:bg-slate-100/60 text-[11px] font-semibold text-slate-400 light:text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Subjects Evaluated</th>
                <th className="py-3 px-4">Total Marks</th>
                <th className="py-3 px-4">Aggregate %</th>
                <th className="py-3 px-4">Term GPA</th>
                <th className="py-3 px-4">Standing</th>
                <th className="py-3 px-4 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 light:divide-slate-200/70">
              {Object.entries(studentResultsMap).map(([studentId, resList]) => {
                const student = students.find((s) => s.id === studentId);
                const scores = resList.map((r) => ({
                  subjectName: '',
                  obtainedMarks: r.obtainedMarks,
                  maxMarks: r.maxMarks,
                }));
                const summary = calculateReportCardSummary(scores, 50);

                return (
                  <tr
                    key={studentId}
                    className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudentForReport(studentId)}
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-100 light:text-slate-900">
                      {student ? `${student.firstName} ${student.lastName}` : 'Student'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 light:text-slate-600">
                      {student?.admissionNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 light:text-slate-700">
                      {resList.length} subjects
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-200 light:text-slate-800">
                      {summary.totalObtained} / {summary.totalMax}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-400 light:text-indigo-600">
                      {summary.percentage}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100 light:text-slate-900">
                      {summary.overallGpa}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={summary.overallGrade.startsWith('A') ? 'success' : 'default'} size="sm">
                        Grade {summary.overallGrade}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Printer className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentForReport(studentId);
                        }}
                      >
                        Report Card
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Report Card Modal */}
      {selectedStudentForReport && targetStudent && (
        <Modal
          isOpen={!!selectedStudentForReport}
          onClose={() => setSelectedStudentForReport(null)}
          title={`Official Report Card: ${targetStudent.firstName} ${targetStudent.lastName}`}
          subtitle={`${activeExam?.title} · ${settings.currentAcademicYear}`}
          size="lg"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                Print Official Report
              </Button>
              <Button size="sm" onClick={() => setSelectedStudentForReport(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="p-6 rounded-xl glass-panel border border-slate-800 light:border-slate-200 light:bg-white text-xs space-y-5">
            {/* School Crest & Header */}
            <div className="text-center pb-4 border-b border-slate-800 light:border-slate-200">
              <h3 className="text-base font-bold text-slate-100 light:text-slate-900">{settings.schoolName}</h3>
              <p className="text-[11px] text-slate-400 light:text-slate-600">{settings.address}</p>
              <p className="text-[10px] text-slate-400 light:text-slate-500 font-mono mt-0.5">ACADEMIC TRANSCRIPT & PERFORMANCE REPORT</p>
            </div>

            {/* Student & Class Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-400 light:text-slate-500 block">STUDENT NAME</span>
                <span className="font-semibold text-slate-200 light:text-slate-900">{targetStudent.firstName} {targetStudent.lastName}</span>
              </div>
              <div>
                <span className="text-slate-400 light:text-slate-500 block">ADMISSION NO</span>
                <span className="font-mono text-slate-200 light:text-slate-900">{targetStudent.admissionNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 light:text-slate-500 block">CLASS & SECTION</span>
                <span className="text-slate-200 light:text-slate-900">Grade 10 - Section A</span>
              </div>
              <div>
                <span className="text-slate-400 light:text-slate-500 block">TERM ATTENDANCE</span>
                <span className="font-mono font-semibold text-emerald-400 light:text-emerald-700">{targetStudent.attendanceRate}%</span>
              </div>
            </div>

            {/* Detailed Subject Marks Matrix */}
            <div className="border border-slate-800 light:border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 light:bg-slate-100 px-3 py-2 border-b border-slate-800 light:border-slate-200 font-semibold text-slate-400 light:text-slate-600 text-[11px]">
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5 text-center">Max Marks</th>
                    <th className="p-2.5 text-center">Obtained</th>
                    <th className="p-2.5 text-center">Grade</th>
                    <th className="p-2.5 text-center">GPA</th>
                    <th className="p-2.5">Evaluator Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
                  {studentExamScores.map((score, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 light:hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-200 light:text-slate-900">{score.subjectName}</td>
                      <td className="p-2.5 text-center font-mono text-slate-400 light:text-slate-600">{score.maxMarks}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-100 light:text-slate-900">{score.obtainedMarks}</td>
                      <td className="p-2.5 text-center">
                        <Badge variant={score.grade.startsWith('A') ? 'success' : 'default'} size="sm">
                          {score.grade}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-center font-mono font-semibold text-indigo-400 light:text-indigo-600">{score.gpa}</td>
                      <td className="p-2.5 text-slate-400 light:text-slate-600 text-[11px] italic">{score.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Overall Term Result Summary */}
            <div className="p-4 rounded-xl bg-slate-900/80 light:bg-slate-100 border border-slate-800 light:border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
              <div className="flex gap-6">
                <div>
                  <span className="text-slate-400 light:text-slate-600 text-[10px] block">TOTAL SCORE</span>
                  <span className="text-sm font-bold text-slate-100 light:text-slate-900">{reportSummary.totalObtained} / {reportSummary.totalMax}</span>
                </div>
                <div>
                  <span className="text-slate-400 light:text-slate-600 text-[10px] block">PERCENTAGE</span>
                  <span className="text-sm font-bold text-indigo-400 light:text-indigo-600">{reportSummary.percentage}%</span>
                </div>
                <div>
                  <span className="text-slate-400 light:text-slate-600 text-[10px] block">TERM GPA</span>
                  <span className="text-sm font-bold text-emerald-400 light:text-emerald-700">{reportSummary.overallGpa} / 4.00</span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="success" size="md">
                  PASSED WITH DISTINCTION
                </Badge>
              </div>
            </div>

            {/* Principal Signature Block */}
            <div className="pt-6 border-t border-slate-800 light:border-slate-200 flex items-center justify-between text-[11px] text-slate-400 light:text-slate-600">
              <div>
                <p className="font-semibold text-slate-300 light:text-slate-900">Marcus Holloway</p>
                <p className="text-[10px] text-slate-400 light:text-slate-500">Class Lead Teacher</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-300 light:text-slate-900">{settings.principalName}</p>
                <p className="text-[10px] text-slate-400 light:text-slate-500">Principal & Head of School</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
