import { QUIZ_QUESTIONS, type QuizQuestion } from "@/lib/quiz/questions";

/**
 * Building a randomised quiz attempt.
 *
 * Each attempt draws a random subset of the bank and shuffles every question's
 * options, so no two runs look the same and answers can't be memorised by
 * position. Shuffling the options moves the correct answer, so the attempt
 * question carries `kunciIndex` — the correct option's index *after* the shuffle
 * — which is what grading checks against later.
 *
 * Randomness uses Math.random, so build an attempt only in a client event
 * handler (never during render/SSR) to avoid a hydration mismatch.
 */

export interface QuizAttemptQuestion {
  id: string;
  soal: string;
  /** Option texts in shuffled order. */
  pilihan: string[];
  /** Index of the correct option within the shuffled `pilihan`. */
  kunciIndex: number;
}

/** Fisher–Yates shuffle; returns a new array, leaving the input untouched. */
export function shuffle<T>(input: readonly T[]): T[] {
  const result = [...input];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Shuffle one question's options, tracking where the correct answer lands. */
function shuffleOptions(question: QuizQuestion): QuizAttemptQuestion {
  const order = shuffle(question.pilihan.map((_, index) => index));
  return {
    id: question.id,
    soal: question.soal,
    pilihan: order.map((index) => question.pilihan[index]),
    kunciIndex: order.indexOf(question.kunci),
  };
}

/**
 * Draw `count` random questions from the bank, each with its options shuffled.
 * If the bank has fewer than `count`, every question is used (still shuffled).
 */
export function buildQuizAttempt(
  count: number,
  bank: QuizQuestion[] = QUIZ_QUESTIONS,
): QuizAttemptQuestion[] {
  return shuffle(bank).slice(0, count).map(shuffleOptions);
}
