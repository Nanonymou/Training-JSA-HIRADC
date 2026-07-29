import type { UploadStatus } from "@/lib/upload/types";

/**
 * The peserta notification email, built from a review decision.
 *
 * One place composes the subject and body so the admin preview and (later) the
 * real send agree on the wording. Only actionable statuses (Disetujui / Perlu
 * Revisi / Ditolak) are announced; Pending doesn't notify.
 */

export interface EmailContent {
  subject: string;
  body: string[];
}

const STATUS_LINE: Record<UploadStatus, string> = {
  Pending: "Berkas latihanmu sedang menunggu ditinjau.",
  Disetujui: "Selamat! Berkas latihanmu telah disetujui.",
  "Perlu Revisi": "Berkas latihanmu perlu revisi sebelum disetujui.",
  Ditolak: "Mohon maaf, berkas latihanmu ditolak.",
};

export function buildReviewEmail(
  nama: string,
  status: UploadStatus,
  comment: string,
): EmailContent {
  const body = [
    `Halo ${nama.trim() || "Peserta"},`,
    STATUS_LINE[status],
  ];
  if (comment.trim()) body.push(`Catatan dari admin: ${comment.trim()}`);
  body.push("Terima kasih telah mengikuti Training JSA & HIRADC.");

  return {
    subject: `Status Latihan JSA & HIRADC: ${status}`,
    body,
  };
}

/** Whether a status change should notify the peserta (Pending doesn't). */
export function shouldNotify(status: UploadStatus): boolean {
  return status !== "Pending";
}
