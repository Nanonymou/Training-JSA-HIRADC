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

/**
 * Resolve the stored URL to something the browser can actually fetch. Blob URLs
 * are absolute https and pass through; older rows may still carry the dev
 * placeholder (`/_dev-blob/...`), so route those to the download endpoint —
 * which returns 404 with a readable message if the bytes aren't there instead
 * of a bare "page not found".
 */
function resolveUploadUrl(id: string, urlBerkas: string): string {
  if (urlBerkas.startsWith("http://") || urlBerkas.startsWith("https://")) {
    return urlBerkas;
  }
  return `/api/uploads/${id}/download`;
}

/** Columns we ever return from a read — never the heavy `fileData` bytes. */
const UPLOAD_COLS = {
  id: uploads.id,
  pesertaNama: uploads.pesertaNama,
  pesertaEmail: uploads.pesertaEmail,
  lokasi: uploads.lokasi,
  fileName: uploads.fileName,
  fileExt: uploads.fileExt,
  fileSize: uploads.fileSize,
  urlBerkas: uploads.urlBerkas,
  status: uploads.status,
  waktuUnggah: uploads.waktuUnggah,
  trainingId: uploads.trainingId,
};

export async function getReviewUploads(
  trainingId: string = DEFAULT_TRAINING_ID,
): Promise<AdminUpload[]> {
  const scope = resolveTrainingId(trainingId);
  const db = getDb();
  if (!db) {
    return isDefaultTraining(scope) ? ADMIN_UPLOADS : [];
  }

  const rows = await db
    .select(UPLOAD_COLS)
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
    url: resolveUploadUrl(row.id, row.urlBerkas),
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
    .select(UPLOAD_COLS)
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
    url: resolveUploadUrl(row.id, row.urlBerkas),
    status: row.status as AdminUpload["status"],
    waktuUnggah: row.waktuUnggah.toISOString(),
    previewKind: previewKindFor(row.fileExt),
  };
}
