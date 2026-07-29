import { asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { materiChapters, materiVersions } from "@/lib/db/schema";
import {
  CONVERSION_PREVIEW,
  MATERI_VERSIONS,
  type ConvertedChapter,
  type MateriVersion,
} from "@/lib/admin/cms-materi";

/**
 * Server-side access to a training's material version history.
 *
 * Reads from Postgres when configured, otherwise the seed history, so the CMS
 * works before a database exists. DB rows are mapped to the same MateriVersion
 * shape the UI uses. Server-only.
 */
export async function getMateriVersions(
  trainingId = "jsa-hiradc",
): Promise<MateriVersion[]> {
  const db = getDb();
  if (!db) return MATERI_VERSIONS;

  const rows = await db
    .select()
    .from(materiVersions)
    .where(eq(materiVersions.trainingId, trainingId))
    .orderBy(desc(materiVersions.version));

  return rows.map((row) => ({
    id: row.id,
    version: row.version,
    updatedBy: row.updatedBy ?? "Admin",
    updatedAt: row.createdAt.toISOString(),
    jumlahBab: 0,
    catatan: row.catatan,
    current: row.isCurrent,
  }));
}

/**
 * Make a version the current (live) one for its training.
 *
 * Unsets `is_current` on the training's other versions, then sets it on this one,
 * so exactly one is live and the peserta material follows it automatically.
 * Returns false when the version doesn't exist. With no database it's a no-op
 * over the seed (returns whether the id is known).
 */
export async function setCurrentVersion(versionId: string): Promise<boolean> {
  const db = getDb();
  if (!db) {
    return MATERI_VERSIONS.some((v) => v.id === versionId);
  }

  const [row] = await db
    .select({ trainingId: materiVersions.trainingId })
    .from(materiVersions)
    .where(eq(materiVersions.id, versionId));
  if (!row) return false;

  await db
    .update(materiVersions)
    .set({ isCurrent: false })
    .where(eq(materiVersions.trainingId, row.trainingId));
  await db
    .update(materiVersions)
    .set({ isCurrent: true })
    .where(eq(materiVersions.id, versionId));
  return true;
}

/** The chapters of a specific version (title + section headings), or null. */
export async function getMateriVersionPreview(
  versionId: string,
): Promise<ConvertedChapter[] | null> {
  const db = getDb();
  if (!db) {
    const version = MATERI_VERSIONS.find((v) => v.id === versionId);
    if (!version) return null;
    return CONVERSION_PREVIEW.slice(0, version.jumlahBab);
  }

  const rows = await db
    .select()
    .from(materiChapters)
    .where(eq(materiChapters.versionId, versionId))
    .orderBy(asc(materiChapters.position));

  if (rows.length === 0) return null;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    sections: (row.sections as { heading?: string }[])
      .map((section) => section.heading ?? "")
      .filter(Boolean),
  }));
}
