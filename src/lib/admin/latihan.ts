import type { UploadStatus } from "@/lib/upload/types";

/**
 * Mock latihan submissions for the admin review screen.
 *
 * Shaped like the uploads table so the review list can be wired to the DB later
 * without changing the components. `previewKind` tells the preview whether a file
 * can be shown inline (PDF/image) or only downloaded (Office docs).
 */

export type PreviewKind = "pdf" | "image" | "unsupported";

export interface AdminUpload {
  id: string;
  pesertaNama: string;
  pesertaEmail: string;
  lokasi: string;
  fileName: string;
  fileExt: string;
  fileSize: number;
  url: string;
  status: UploadStatus;
  waktuUnggah: string;
  previewKind: PreviewKind;
}

/** Find one upload by id, or null. */
export function getAdminUpload(id: string): AdminUpload | null {
  return ADMIN_UPLOADS.find((upload) => upload.id === id) ?? null;
}

// No seed uploads — the review screen shows only real submissions.
export const ADMIN_UPLOADS: AdminUpload[] = [];
