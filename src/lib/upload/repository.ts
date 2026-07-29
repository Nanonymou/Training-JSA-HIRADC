import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { uploads, type NewUploadRow, type UploadRow } from "@/lib/db/schema";
import type { UploadStatus } from "@/lib/upload/types";

/**
 * Server-side persistence for latihan uploads.
 *
 * Inserts into the uploads table when the database is configured; without one it
 * returns a synthetic row so the endpoint still responds with a record in dev.
 * Server-only.
 */
export async function saveUpload(input: NewUploadRow): Promise<UploadRow> {
  const db = getDb();
  if (db) {
    const [row] = await db.insert(uploads).values(input).returning();
    return row;
  }

  // No database: echo back a complete row so the client gets a usable record.
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    trainingId: input.trainingId ?? "jsa-hiradc",
    pesertaNama: input.pesertaNama,
    pesertaEmail: input.pesertaEmail,
    lokasi: input.lokasi ?? null,
    fileName: input.fileName,
    fileSize: input.fileSize,
    fileExt: input.fileExt,
    urlBerkas: input.urlBerkas,
    status: input.status ?? "Pending",
    adminComment: input.adminComment ?? null,
    reviewedBy: null,
    reviewedAt: null,
    waktuUnggah: new Date(),
  };
}

export interface ReviewUpdate {
  status: UploadStatus;
  comment: string;
  reviewer: string;
}

export interface ReviewResult {
  /** false only when a DB is configured and no upload matched the id. */
  found: boolean;
  /** The updated row when a DB applied the change; null in the dev fallback. */
  row: UploadRow | null;
}

/**
 * Apply an admin's review decision to an upload: its status, comment, and who
 * reviewed it when. With a DB, `found` reflects whether the upload existed.
 * Without one it reports `found: true` so the endpoint still responds in dev
 * (the client keeps a local copy of the decision).
 */
export async function updateReview(
  uploadId: string,
  update: ReviewUpdate,
): Promise<ReviewResult> {
  const db = getDb();
  if (!db) {
    return { found: true, row: null };
  }

  const [row] = await db
    .update(uploads)
    .set({
      status: update.status,
      adminComment: update.comment || null,
      reviewedBy: update.reviewer,
      reviewedAt: new Date(),
    })
    .where(eq(uploads.id, uploadId))
    .returning();

  return { found: Boolean(row), row: row ?? null };
}
