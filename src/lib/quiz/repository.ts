import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { questions, quizAttempts } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/db/seed";
import { shuffle } from "@/lib/quiz/attempt";
import { QUIZ_CONFIG } from "@/lib/quiz/config";
import { QUIZ_QUESTIONS } from "@/lib/quiz/questions";
import {
  DEFAULT_TRAINING_ID,
  isDefaultTraining,
  resolveTrainingId,
} from "@/lib/training/scope";

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

/**
 * Every question with its options for one training, from the DB or the seed
 * fallback. The seed bank belongs to the default training, so a non-default
 * scope returns nothing from the seed — matching the DB's per-training filter.
 */
export async function getQuestionRecords(
  trainingId: string = DEFAULT_TRAINING_ID,
): Promise<QuizQuestionRecord[]> {
  const scope = resolveTrainingId(trainingId);
  const db = getDb();
  if (!db) return isDefaultTraining(scope) ? seedRecords() : [];

  await ensureSeeded();

  const rows = await db.query.questions.findMany({
    where: eq(questions.trainingId, scope),
    with: { options: true },
  });
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
  trainingId: string = DEFAULT_TRAINING_ID,
): Promise<PublicQuizQuestion[]> {
  const records = await getQuestionRecords(trainingId);
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

/** One submitted answer: the question and the option the peserta chose. */
export interface SubmittedAnswer {
  questionId: string;
  optionId: string;
}

export interface GradeOutcome {
  total: number;
  correct: number;
  /** Percentage correct, 0–100, rounded. */
  score: number;
  lulus: boolean;
  passingGrade: number;
}

/**
 * Grade a submission server-side.
 *
 * Correctness is looked up by option id against the stored bank — never trusted
 * from the client — so a chosen option only counts when it exists, belongs to
 * the question it's claimed under, and is flagged correct. The denominator is
 * the number of answers submitted (the runner gates submit until all served
 * questions are answered).
 */
export async function gradeSubmission(
  answers: SubmittedAnswer[],
  trainingId: string = DEFAULT_TRAINING_ID,
): Promise<GradeOutcome> {
  const records = await getQuestionRecords(trainingId);

  const optionsById = new Map<
    string,
    { questionId: string; isCorrect: boolean }
  >();
  for (const question of records) {
    for (const option of question.options) {
      optionsById.set(option.id, {
        questionId: question.id,
        isCorrect: option.isCorrect,
      });
    }
  }

  const correct = answers.reduce((sum, answer) => {
    const option = optionsById.get(answer.optionId);
    const hit =
      option?.questionId === answer.questionId && option?.isCorrect === true;
    return sum + (hit ? 1 : 0);
  }, 0);

  const total = answers.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  return {
    total,
    correct,
    score,
    lulus: score >= QUIZ_CONFIG.passingGrade,
    passingGrade: QUIZ_CONFIG.passingGrade,
  };
}

/** The peserta a quiz attempt belongs to (from the Daftar Hadir session). */
export interface AttemptPeserta {
  nama: string;
  email: string;
  jabatan?: string;
  lokasi?: string;
}

/**
 * Persist a graded attempt (if a database is configured) so the admin's reports
 * and Data Peserta reflect real quiz results. Best effort — never throws.
 */
export async function saveQuizAttempt(
  peserta: AttemptPeserta,
  outcome: GradeOutcome,
  trainingId: string = DEFAULT_TRAINING_ID,
): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await db.insert(quizAttempts).values({
      trainingId: resolveTrainingId(trainingId),
      pesertaNama: peserta.nama,
      pesertaEmail: peserta.email,
      jabatan: peserta.jabatan,
      lokasi: peserta.lokasi,
      score: outcome.score,
      correct: outcome.correct,
      total: outcome.total,
      lulus: outcome.lulus,
    });
  } catch (error) {
    console.error("[quiz] gagal menyimpan attempt:", error);
  }
}
