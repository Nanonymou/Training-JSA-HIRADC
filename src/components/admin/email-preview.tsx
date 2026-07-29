"use client";

import { Mail } from "lucide-react";

import { buildReviewEmail, shouldNotify } from "@/lib/admin/email-template";
import { useReviews } from "@/hooks/use-reviews";
import type { UploadStatus } from "@/lib/upload/types";

/**
 * Preview of the email the peserta will receive (mock).
 *
 * Reads the saved review for this upload and composes the notification, so the
 * admin can see exactly what gets sent when they update the status. Pending shows
 * a note that no email is sent. Sending is wired in the backend phase.
 */
export function EmailPreview({
  uploadId,
  pesertaNama,
  pesertaEmail,
  fallbackStatus,
}: {
  uploadId: string;
  pesertaNama: string;
  pesertaEmail: string;
  fallbackStatus: UploadStatus;
}) {
  const { reviews } = useReviews();
  const review = reviews[uploadId];
  const status = review?.status ?? fallbackStatus;
  const comment = review?.comment ?? "";
  const email = buildReviewEmail(pesertaNama, status, comment);

  return (
    <div className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <Mail className="text-muted-foreground size-4" />
        <p className="text-sm font-semibold tracking-tight">
          Pratinjau Notifikasi Email
        </p>
      </div>

      {shouldNotify(status) ? (
        <div className="border-border overflow-hidden rounded-lg border">
          <div className="bg-muted/40 flex flex-col gap-0.5 border-b px-3 py-2 text-xs">
            <p>
              <span className="text-muted-foreground">Kepada: </span>
              <span className="font-medium">{pesertaEmail}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Subjek: </span>
              <span className="font-medium">{email.subject}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 px-3 py-3 text-sm">
            {email.body.map((line, index) => (
              <p key={index} className="text-foreground/90 text-pretty">
                {line}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 text-xs">
          Status masih <span className="font-medium">Pending</span> — belum ada
          email yang dikirim ke peserta.
        </p>
      )}
    </div>
  );
}
