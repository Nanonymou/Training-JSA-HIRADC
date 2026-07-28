import {
  MATERI_CHAPTERS,
  MATERI_TOTAL_MINUTES,
  type MateriChapter,
} from "@/lib/materi/chapters";

/**
 * Server-side access to the training material.
 *
 * The one place the API routes and the Materi page read chapters from, so both
 * serve identical content. It's backed by the seed data modelled from the JSA &
 * HIRADC handbook for now; the functions are async and return plain shapes so
 * this stays the seam where Vercel Postgres / Drizzle lands later — swapping the
 * body of each getter won't touch a caller. Keep this out of client bundles: only
 * server components and route handlers should import it.
 */

/** The API's overview payload: chapters plus a couple of headline counts. */
export interface MateriOverview {
  chapters: MateriChapter[];
  chapterCount: number;
  totalMinutes: number;
}

/** Every chapter, in reading order. */
export async function getMateriChapters(): Promise<MateriChapter[]> {
  return MATERI_CHAPTERS;
}

/** One chapter by id, or null when it doesn't exist. */
export async function getMateriChapter(
  id: string,
): Promise<MateriChapter | null> {
  return MATERI_CHAPTERS.find((chapter) => chapter.id === id) ?? null;
}

/** The chapters plus the totals the UI shows at a glance. */
export async function getMateriOverview(): Promise<MateriOverview> {
  const chapters = await getMateriChapters();
  return {
    chapters,
    chapterCount: chapters.length,
    totalMinutes: MATERI_TOTAL_MINUTES,
  };
}
