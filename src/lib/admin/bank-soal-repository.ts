import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { questionOptions, questions } from "@/lib/db/schema";
import type { SoalDraft } from "@/lib/admin/soal-draft";

/**
 * Server-side writes for the question bank.
 *
 * Inserts the question and its options (the chosen one flagged correct) when the
 * database is configured; without one it returns a synthetic record so the
 * endpoint still responds in dev. Server-only.
 */

export interface SoalRecord extends SoalDraft {
  id: string;
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}`;
}

export async function createSoal(draft: SoalDraft): Promise<SoalRecord> {
  const db = getDb();
  if (!db) {
    return { id: newId(), ...draft };
  }

  const [question] = await db
    .insert(questions)
    .values({ soal: draft.soal, category: draft.kategori })
    .returning({ id: questions.id });

  await db.insert(questionOptions).values(
    draft.pilihan.map((label, index) => ({
      questionId: question.id,
      label,
      isCorrect: index === draft.kunci,
      position: index,
    })),
  );

  return { id: question.id, ...draft };
}

export async function updateSoal(
  id: string,
  draft: SoalDraft,
): Promise<SoalRecord> {
  const db = getDb();
  if (!db) {
    return { id, ...draft };
  }

  await db
    .update(questions)
    .set({ soal: draft.soal, category: draft.kategori })
    .where(eq(questions.id, id));

  await db.delete(questionOptions).where(eq(questionOptions.questionId, id));

  await db.insert(questionOptions).values(
    draft.pilihan.map((label, index) => ({
      questionId: id,
      label,
      isCorrect: index === draft.kunci,
      position: index,
    })),
  );

  return { id, ...draft };
}
