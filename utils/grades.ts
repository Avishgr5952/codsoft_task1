export interface GradeThreshold {
  minPercentage: number;
  grade: string;
  isPass: boolean;
}

export const DEFAULT_GRADE_SYSTEM: GradeThreshold[] = [
  { minPercentage: 90, grade: 'A+', isPass: true },
  { minPercentage: 80, grade: 'A', isPass: true },
  { minPercentage: 70, grade: 'B', isPass: true },
  { minPercentage: 60, grade: 'C', isPass: true },
  { minPercentage: 50, grade: 'D', isPass: true },
  { minPercentage: 0, grade: 'F', isPass: false },
];

export function calculateGradeAndStatus(
  marksObtained: number,
  maxMarks: number,
  thresholds: GradeThreshold[] = DEFAULT_GRADE_SYSTEM
) {
  if (maxMarks <= 0) {
    return { percentage: 0, grade: 'F', status: 'FAIL' as const };
  }

  const percentage = Math.round(((marksObtained / maxMarks) * 100) * 100) / 100;
  
  // Find matching threshold sorted descending
  const sorted = [...thresholds].sort((a, b) => b.minPercentage - a.minPercentage);
  const matched = sorted.find((t) => percentage >= t.minPercentage) || sorted[sorted.length - 1];

  return {
    percentage,
    grade: matched.grade,
    status: (matched.isPass ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
  };
}
