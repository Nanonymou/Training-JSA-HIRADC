import { desc } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { trainings } from "@/lib/db/schema";
import { TRAINING_MODULES } from "@/lib/admin/cms-materi";

/**
 * Server-side access to training topics for the multi-training admin screen.
 *
 * Reads the trainings table when a database is configured, otherwise the seed
 * modules, so the screen works before a database exists. `jumlahBab` (chapter
 * count) is derived from the material and defaults to 0 for DB rows until the
 * CMS join lands — the seed carries real counts. Server-only.
 */

export interface AdminTraining {
  id: string;
  slug: string;
  judul: string;
  deskripsi: string;
  aktif: boolean;
  archived: boolean;
  jumlahBab: number;
  updated: string;
}

export async function getAdminTrainings(): Promise<AdminTraining[]> {
  const db = getDb();
  if (!db) {
    return TRAINING_MODULES.map((m) => ({
      id: m.id,
      slug: m.id,
      judul: m.judul,
      deskripsi: m.deskripsi,
      aktif: m.aktif,
      archived: false,
      jumlahBab: m.jumlahBab,
      updated: m.updated,
    }));
  }

  const rows = await db
    .select()
    .from(trainings)
    .orderBy(desc(trainings.updatedAt));

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    judul: row.judul,
    deskripsi: row.deskripsi,
    aktif: row.aktif,
    archived: row.archived,
    jumlahBab: 0,
    updated: row.updatedAt.toISOString(),
  }));
}
