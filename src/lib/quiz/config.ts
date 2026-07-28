/**
 * Quiz rules, per the PRD.
 *
 * Ten random multiple-choice questions, pass at 80. Kept in one place so the
 * intro screen, the runner, and any grading agree on the same numbers.
 */
export const QUIZ_CONFIG = {
  /** How many questions each attempt serves. */
  jumlahSoal: 10,
  /** Minimum score (0–100) to pass. */
  passingGrade: 80,
} as const;
