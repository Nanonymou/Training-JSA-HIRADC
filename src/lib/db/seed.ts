import { getDb } from "@/lib/db/client";
import { questionOptions, questions, trainings } from "@/lib/db/schema";
import { QUIZ_QUESTIONS } from "@/lib/quiz/questions";
import { TRAINING_MODULES } from "@/lib/admin/cms-materi";
import { DEFAULT_TRAINING_ID } from "@/lib/training/scope";

/**
 * One-time database seeding of the initial content.
 *
 * A fresh database (after migration) is empty, so the quiz would have no
 * questions and the CMS no training. This seeds the primary training and the
 * starter question bank ONCE — gated on the training row's absence, so it runs
 * only on a brand-new database and never resurrects content the admin has since
 * deleted. Cached per server instance and a no-op without a database. Server-only.
 */

let seedPromise: Promise<void> | null = null;

export function ensureSeeded(): Promise<void> {
  if (!seedPromise) seedPromise = doSeed();
  return seedPromise;
}

async function doSeed(): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    // The training row is the "already seeded" marker: if it exists, this
    // database has been seeded before — do nothing.
    const existing = await db
      .select({ id: trainings.id })
      .from(trainings)
      .limit(1);
    if (existing.length > 0) return;

    const primary = TRAINING_MODULES[0];
    await db.insert(trainings).values({
      slug: DEFAULT_TRAINING_ID,
      judul: primary?.judul ?? "Penyusunan dan Pengisian JSA & HIRADC",
      deskripsi: primary?.deskripsi ?? "",
      aktif: true,
      archived: false,
    });

    for (const q of QUIZ_QUESTIONS) {
      const [row] = await db
        .insert(questions)
        .values({ soal: q.soal, trainingId: DEFAULT_TRAINING_ID })
        .returning({ id: questions.id });
      await db.insert(questionOptions).values(
        q.pilihan.map((label, index) => ({
          questionId: row.id,
          label,
          isCorrect: index === q.kunci,
          position: index,
        })),
      );
    }
  } catch (error) {
    console.error("[seed] gagal menyemai database:", error);
    // Allow a later request to retry.
    seedPromise = null;
  }
}
