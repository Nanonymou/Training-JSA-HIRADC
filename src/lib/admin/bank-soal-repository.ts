import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { questionOptions, questions } from "@/lib/db/schema";
import type { SoalDraft } from "@/lib/admin/soal-draft";
import { DEFAULT_CATEGORY } from "@/lib/admin/soal-categories";

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

export async function duplicateSoal(id: string): Promise<SoalRecord | null> {
  const db = getDb();
  if (!db) {
    // No DB in dev: the client duplicates optimistically; just mint an id.
    return { id: newId(), soal: "", pilihan: [], kunci: 0, kategori: DEFAULT_CATEGORY };
  }

  const [source] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, id))
    .limit(1);
  if (!source) return null;

  const options = await db
    .select()
    .from(questionOptions)
    .where(eq(questionOptions.questionId, id))
    .orderBy(questionOptions.position);

  const draft: SoalDraft = {
    soal: `${source.soal} (salinan)`,
    pilihan: options.map((o) => o.label),
    kunci: Math.max(
      0,
      options.findIndex((o) => o.isCorrect),
    ),
    kategori: source.category,
  };

  return createSoal(draft);
}

export async function deleteSoal(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  // question_options cascade on the question's delete (onDelete: "cascade").
  await db.delete(questions).where(eq(questions.id, id));
}
