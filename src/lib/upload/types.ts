/**
 * A submitted latihan file, as the UI tracks it.
 *
 * Mirrors the PRD's UPLOAD_LATIHAN row (minus the storage url, added when the
 * Vercel Blob upload lands): the file's name/size, when it was sent, and its
 * review status. Status starts "Pending" and the admin later moves it.
 */
export type UploadStatus = "Pending" | "Disetujui" | "Perlu Revisi" | "Ditolak";

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  ext: string;
  /** ISO timestamp the file was submitted. */
  waktuUnggah: string;
  status: UploadStatus;
  /** Stored file URL (Vercel Blob), when available. */
  url?: string;
}
