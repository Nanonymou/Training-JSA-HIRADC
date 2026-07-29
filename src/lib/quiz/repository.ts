import { getDb } from "@/lib/db/client";
import { shuffle } from "@/lib/quiz/attempt";
import { QUIZ_QUESTIONS } from "@/lib/quiz/questions";

/**
 * Server-side access to the quiz question bank.
 *
 * Reads from Postgres when configured, otherwise from the seed bank, so the app
 * works before a database exists. Two shapes leave this module: the internal
 * record (which includes `isCorrect` for grading) never leaves the server, and
 * the public question (options as id + label only) is what the fetch-questions
 * endpoint returns — the correct answer is deliberately withheld so it can't be
 * read off the wire. Option ids are stable (real rows in the DB, deterministic
 * `question::position` for seed data), so a later submit endpoint can grade by
 * option id without the server having to remember each attempt's shuffle.
 *
 * Keep this out of client bundles: only server components and route handlers
 * should import it.
 */

/** An option as stored — includes whether it's the correct answer. */
export interface QuizOptionRecord {
  id: string;
  label: string;
  isCorrect: boolean;
  position: number;
}

/** A question with all its options, server-side. */
export interface QuizQuestionRecord {
  id: string;
  soal: string;
  options: QuizOptionRecord[];
}

/** What the client sees: options carry no correctness flag. */
export interface PublicQuizOption {
  id: string;
  label: string;
}

export interface PublicQuizQuestion {
  id: string;
  soal: string;
  pilihan: PublicQuizOption[];
}

/** The seed bank as records, with deterministic, stable option ids. */
function seedRecords(): QuizQuestionRecord[] {
  return QUIZ_QUESTIONS.map((question) => ({
    id: question.id,
    soal: question.soal,
    options: question.pilihan.map((label, index) => ({
      id: `${question.id}::${index}`,
      label,
      isCorrect: index === question.kunci,
      position: index,
    })),
  }));
}

/** Every question with its options, from the DB or the seed fallback. */
export async function getQuestionRecords(): Promise<QuizQuestionRecord[]> {
  const db = getDb();
  if (!db) return seedRecords();

  const rows = await db.query.questions.findMany({ with: { options: true } });
  return rows.map((row) => ({
    id: row.id,
    soal: row.soal,
    options: [...row.options]
      .sort((a, b) => a.position - b.position)
      .map((option) => ({
        id: option.id,
        label: option.label,
        isCorrect: option.isCorrect,
        position: option.position,
      })),
  }));
}

/**
 * A random attempt: `count` random questions, each with its options shuffled,
 * stripped down to the public shape (no correct-answer flag).
 */
export async function getRandomQuizQuestions(
  count: number,
): Promise<PublicQuizQuestion[]> {
  const records = await getQuestionRecords();
  return shuffle(records)
    .slice(0, count)
    .map((question) => ({
      id: question.id,
      soal: question.soal,
      pilihan: shuffle(question.options).map((option) => ({
        id: option.id,
        label: option.label,
      })),
    }));
}
