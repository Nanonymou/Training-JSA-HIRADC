import { buildReviewEmail, shouldNotify } from "@/lib/admin/email-template";
import { sendReviewEmail } from "@/lib/admin/email-service";
import { updateNotifStatus } from "@/lib/upload/repository";
import type { UploadStatus } from "@/lib/upload/types";

/**
 * Send the peserta the review-decision email and record its outcome on the
 * upload — the one place that ties a review decision to a notification, shared
 * by the review-update flow and the manual "send email" route.
 *
 * A Pending status or a missing address is a no-op (`skipped`); otherwise the
 * email is composed, sent via the email service, and the Terkirim/Gagal status
 * is stored on the upload. Server-only.
 */

export interface NotifyReviewInput {
  uploadId: string;
  pesertaNama: string;
  pesertaEmail: string;
  status: UploadStatus;
  comment: string;
}

export interface NotifyReviewResult {
  sent: boolean;
  skipped: boolean;
  status?: "Terkirim" | "Gagal";
  sentAt?: Date | null;
  dev?: boolean;
  error?: string;
}

export async function notifyReviewDecision(
  input: NotifyReviewInput,
): Promise<NotifyReviewResult> {
  if (!shouldNotify(input.status) || !input.pesertaEmail.trim()) {
    return { sent: false, skipped: true };
  }

  const email = buildReviewEmail(input.pesertaNama, input.status, input.comment);
  const result = await sendReviewEmail({
    to: input.pesertaEmail.trim(),
    content: email,
  });

  await updateNotifStatus(input.uploadId, result.status, result.sentAt);

  return {
    sent: result.status === "Terkirim",
    skipped: false,
    status: result.status,
    sentAt: result.sentAt,
    dev: result.dev,
    error: result.error,
  };
}
