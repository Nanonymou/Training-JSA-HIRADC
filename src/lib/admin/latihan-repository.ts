import { desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { uploads } from "@/lib/db/schema";
import { ADMIN_UPLOADS, type AdminUpload, type PreviewKind } from "@/lib/admin/latihan";
import {
  DEFAULT_TRAINING_ID,
  isDefaultTraining,
  resolveTrainingId,
} from "@/lib/training/scope";

/**
 * Server-side reads for the latihan review screen.
 *
 * Lists uploads with their current review status so the admin can see decisions
 * made on other devices. Reads the uploads table when a database is configured;
 * without one it serves the mock seed so the endpoint still responds in dev.
 * Server-only.
 */

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

/** Whether a file can be shown inline (PDF/image) or only downloaded. */
function previewKindFor(ext: string): PreviewKind {
  const lower = ext.toLowerCase();
  if (lower === "pdf") return "pdf";
  if (IMAGE_EXTS.includes(lower)) return "image";
  return "unsupported";
}

export async function getReviewUploads(
  trainingId: string = DEFAULT_TRAINING_ID,
): Promise<AdminUpload[]> {
  const scope = resolveTrainingId(trainingId);
  const db = getDb();
  if (!db) {
    return isDefaultTraining(scope) ? ADMIN_UPLOADS : [];
  }

  const rows = await db
    .select()
    .from(uploads)
    .where(eq(uploads.trainingId, scope))
    .orderBy(desc(uploads.waktuUnggah));

  return rows.map((row) => ({
    id: row.id,
    pesertaNama: row.pesertaNama,
    pesertaEmail: row.pesertaEmail,
    lokasi: row.lokasi ?? "",
    fileName: row.fileName,
    fileExt: row.fileExt,
    fileSize: row.fileSize,
    url: row.urlBerkas,
    status: row.status as AdminUpload["status"],
    waktuUnggah: row.waktuUnggah.toISOString(),
    previewKind: previewKindFor(row.fileExt),
  }));
}

/** One upload by id, or null. Server-side; DB with seed fallback. */
export async function getReviewUploadById(
  id: string,
): Promise<AdminUpload | null> {
  const db = getDb();
  if (!db) return ADMIN_UPLOADS.find((u) => u.id === id) ?? null;

  const [row] = await db
    .select()
    .from(uploads)
    .where(eq(uploads.id, id))
    .limit(1);
  if (!row) return null;

  return {
    id: row.id,
    pesertaNama: row.pesertaNama,
    pesertaEmail: row.pesertaEmail,
    lokasi: row.lokasi ?? "",
    fileName: row.fileName,
    fileExt: row.fileExt,
    fileSize: row.fileSize,
    url: row.urlBerkas,
    status: row.status as AdminUpload["status"],
    waktuUnggah: row.waktuUnggah.toISOString(),
    previewKind: previewKindFor(row.fileExt),
  };
}
