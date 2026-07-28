import type { QuizAttemptQuestion } from "@/lib/quiz/attempt";

/**
 * Grading a quiz attempt.
 *
 * A plain function so the result screen and (later) a server route can score the
 * same way. An answer is correct when the chosen option index matches the
 * question's post-shuffle `kunciIndex`; the score is the percentage correct,
 * rounded, and `lulus` is that score against the passing grade.
 */
export interface QuizResult {
  total: number;
  correct: number;
  /** Percentage correct, 0–100, rounded. */
  score: number;
  lulus: boolean;
}

export function gradeAttempt(
  attempt: QuizAttemptQuestion[],
  answers: Record<string, number>,
  passingGrade: number,
): QuizResult {
  const total = attempt.length;
  const correct = attempt.reduce(
    (sum, question) => sum + (answers[question.id] === question.kunciIndex ? 1 : 0),
    0,
  );
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { total, correct, score, lulus: score >= passingGrade };
}
