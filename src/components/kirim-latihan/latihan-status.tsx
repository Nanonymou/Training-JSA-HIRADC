"use client";

import { FileText, MessageSquare } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { useReviews } from "@/hooks/use-reviews";
import { ADMIN_UPLOADS } from "@/lib/admin/latihan";

// A peserta's own submissions (mock): the first few shared uploads.
const MY_SUBMISSIONS = ADMIN_UPLOADS.slice(0, 3);

function formatWaktu(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

/**
 * The peserta's view of their submitted latihan and its review status.
 *
 * Reads the same review store the admin writes to, so an admin's decision (status
 * and comment) shows here without a round-trip — the peserta sees whether their
 * work was approved or needs revision, and any feedback. Mock submissions for now.
 */
export function LatihanStatus() {
  const { reviews } = useReviews();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-tight">Riwayat & Status</h2>
      <ul className="flex flex-col gap-2">
        {MY_SUBMISSIONS.map((upload) => {
          const review = reviews[upload.id];
          const status = review?.status ?? upload.status;
          return (
            <li
              key={upload.id}
              className="bg-card border-border flex flex-col gap-2 rounded-xl border p-3"
            >
              <div className="flex items-center gap-3">
                <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <FileText className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {upload.fileName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Dikirim {formatWaktu(upload.waktuUnggah)}
                  </p>
                </div>
                <StatusBadge status={status} />
              </div>
              {review?.comment && (
                <p className="text-foreground/90 bg-muted/40 flex gap-2 rounded-lg px-3 py-2 text-xs text-pretty">
                  <MessageSquare className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                  {review.comment}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
