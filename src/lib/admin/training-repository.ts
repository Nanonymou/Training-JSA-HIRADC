import { desc, eq } from "drizzle-orm";

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

/** A slug from a title: lowercase, dashes, ascii word chars only. */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "training"
  );
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}`;
}

export interface TrainingDraft {
  judul: string;
  deskripsi: string;
}

export async function createTraining(
  draft: TrainingDraft,
): Promise<AdminTraining> {
  const now = new Date();
  const slug = slugify(draft.judul);
  const db = getDb();

  if (!db) {
    return {
      id: newId(),
      slug,
      judul: draft.judul,
      deskripsi: draft.deskripsi,
      aktif: false,
      archived: false,
      jumlahBab: 0,
      updated: now.toISOString(),
    };
  }

  const [row] = await db
    .insert(trainings)
    .values({
      slug,
      judul: draft.judul,
      deskripsi: draft.deskripsi,
      aktif: false,
      archived: false,
    })
    .returning();

  return {
    id: row.id,
    slug: row.slug,
    judul: row.judul,
    deskripsi: row.deskripsi,
    aktif: row.aktif,
    archived: row.archived,
    jumlahBab: 0,
    updated: row.updatedAt.toISOString(),
  };
}

export async function updateTraining(
  id: string,
  draft: TrainingDraft,
): Promise<AdminTraining | null> {
  const db = getDb();
  const now = new Date();

  if (!db) {
    return {
      id,
      slug: slugify(draft.judul),
      judul: draft.judul,
      deskripsi: draft.deskripsi,
      aktif: false,
      archived: false,
      jumlahBab: 0,
      updated: now.toISOString(),
    };
  }

  const [row] = await db
    .update(trainings)
    .set({ judul: draft.judul, deskripsi: draft.deskripsi, updatedAt: now })
    .where(eq(trainings.id, id))
    .returning();
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    judul: row.judul,
    deskripsi: row.deskripsi,
    aktif: row.aktif,
    archived: row.archived,
    jumlahBab: 0,
    updated: row.updatedAt.toISOString(),
  };
}

/**
 * Archive or restore a training. Archiving also deactivates it so it can't be
 * live while archived. Returns the updated row, or null if none matched.
 */
export async function setTrainingArchived(
  id: string,
  archived: boolean,
): Promise<AdminTraining | null> {
  const db = getDb();
  const now = new Date();

  if (!db) {
    return {
      id,
      slug: id,
      judul: "",
      deskripsi: "",
      aktif: false,
      archived,
      jumlahBab: 0,
      updated: now.toISOString(),
    };
  }

  const [row] = await db
    .update(trainings)
    .set({
      archived,
      // Archiving takes it offline; restoring leaves it inactive to re-enable.
      ...(archived ? { aktif: false } : {}),
      updatedAt: now,
    })
    .where(eq(trainings.id, id))
    .returning();
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    judul: row.judul,
    deskripsi: row.deskripsi,
    aktif: row.aktif,
    archived: row.archived,
    jumlahBab: 0,
    updated: row.updatedAt.toISOString(),
  };
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
