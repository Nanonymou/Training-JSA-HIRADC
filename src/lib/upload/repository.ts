import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { uploads, type NewUploadRow, type UploadRow } from "@/lib/db/schema";
import type { UploadStatus } from "@/lib/upload/types";
import { DEFAULT_TRAINING_ID } from "@/lib/training/scope";

/** Upload row without the heavy `fileData` bytes — the shape callers get back. */
export type UploadSummary = Omit<UploadRow, "fileData">;

/**
 * Server-side persistence for latihan uploads.
 *
 * Inserts into the uploads table when the database is configured; without one it
 * returns a synthetic row so the endpoint still responds with a record in dev.
 * The `fileData` bytes column is set on insert but never returned to callers.
 * Server-only.
 */
export async function saveUpload(input: NewUploadRow): Promise<UploadSummary> {
  const db = getDb();
  if (db) {
    const [row] = await db
      .insert(uploads)
      .values(input)
      .returning({
        id: uploads.id,
        trainingId: uploads.trainingId,
        pesertaNama: uploads.pesertaNama,
        pesertaEmail: uploads.pesertaEmail,
        lokasi: uploads.lokasi,
        fileName: uploads.fileName,
        fileSize: uploads.fileSize,
        fileExt: uploads.fileExt,
        urlBerkas: uploads.urlBerkas,
        status: uploads.status,
        adminComment: uploads.adminComment,
        reviewedBy: uploads.reviewedBy,
        reviewedAt: uploads.reviewedAt,
        notifStatus: uploads.notifStatus,
        notifSentAt: uploads.notifSentAt,
        waktuUnggah: uploads.waktuUnggah,
      });
    return row;
  }

  // No database: echo back a complete row so the client gets a usable record.
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    trainingId: input.trainingId ?? DEFAULT_TRAINING_ID,
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
    notifStatus: "Belum",
    notifSentAt: null,
    waktuUnggah: new Date(),
  };
}

/** Update just the download URL on an upload row (used after bytes-fallback insert). */
export async function setUploadUrl(id: string, url: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.update(uploads).set({ urlBerkas: url }).where(eq(uploads.id, id));
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

/**
 * Record the outcome of a notification email on the upload row: its status
 * (Terkirim / Gagal) and, on success, when it was sent. `found` mirrors
 * updateReview's dev-vs-DB semantics.
 */
export async function updateNotifStatus(
  uploadId: string,
  status: "Terkirim" | "Gagal",
  sentAt: Date | null,
): Promise<ReviewResult> {
  const db = getDb();
  if (!db) {
    return { found: true, row: null };
  }

  const [row] = await db
    .update(uploads)
    .set({ notifStatus: status, notifSentAt: sentAt })
    .where(eq(uploads.id, uploadId))
    .returning();

  return { found: Boolean(row), row: row ?? null };
}
