"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { buildReviewEmail, shouldNotify } from "@/lib/admin/email-template";
import { useReviews } from "@/hooks/use-reviews";
import type { UploadStatus } from "@/lib/upload/types";

type SendState = "idle" | "sending" | "sent" | "error";

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

  const [send, setSend] = useState<SendState>("idle");

  async function sendEmail() {
    setSend("sending");
    // Simulate the send until the email API lands in the backend phase.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSend("sent");
    toast({
      title: "Email terkirim",
      description: pesertaEmail,
      variant: "success",
    });
  }

  return (
    <div className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail className="text-muted-foreground size-4" />
          <p className="text-sm font-semibold tracking-tight">
            Pratinjau Notifikasi Email
          </p>
        </div>
        {send === "sending" && (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Loader2 className="size-3.5 animate-spin" />
            Mengirim…
          </span>
        )}
        {send === "sent" && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            Terkirim
          </span>
        )}
      </div>

      {shouldNotify(status) ? (
        <div className="border-border bg-background overflow-hidden rounded-lg border shadow-sm">
          <div className="border-border bg-muted/40 flex items-center gap-2.5 border-b px-3 py-2.5">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
              <Mail className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                Training JSA &amp; HIRADC
              </p>
              <p className="text-muted-foreground truncate text-xs">
                no-reply@tpb.co.id
              </p>
            </div>
          </div>
          <div className="border-border grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-b px-3 py-2 text-xs">
            <span className="text-muted-foreground">Kepada</span>
            <span className="min-w-0 truncate font-medium">{pesertaEmail}</span>
            <span className="text-muted-foreground">Subjek</span>
            <span className="min-w-0 truncate font-medium">{email.subject}</span>
          </div>
          <div className="flex flex-col gap-2 px-4 py-3 text-sm leading-relaxed">
            {email.body.map((line, index) => (
              <p key={index} className="text-foreground/90 text-pretty">
                {line}
              </p>
            ))}
            <div className="pt-1">
              <Button
                size="sm"
                onClick={sendEmail}
                disabled={send === "sending"}
              >
                {send === "sending" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Send />
                )}
                {send === "sent" ? "Kirim Ulang" : "Kirim Email"}
              </Button>
            </div>
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
