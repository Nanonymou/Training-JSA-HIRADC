import { desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { materiVersions } from "@/lib/db/schema";
import { MATERI_VERSIONS, type MateriVersion } from "@/lib/admin/cms-materi";

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
