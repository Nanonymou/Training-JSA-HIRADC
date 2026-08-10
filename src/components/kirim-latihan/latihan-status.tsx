"use client";

import { useEffect, useState } from "react";
import { FileText, MessageSquare } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { useReviews } from "@/hooks/use-reviews";
import { usePeserta } from "@/hooks/use-peserta";
import type { UploadStatus } from "@/lib/upload/types";
import { cn } from "@/lib/utils";

/** Left-accent and comment-box tint per review status. */
const STATUS_TONE: Record<UploadStatus, { accent: string; comment: string }> = {
  Pending: {
    accent: "border-l-amber-500/60",
    comment: "bg-amber-500/5 text-amber-700 dark:text-amber-300",
  },
  Disetujui: {
    accent: "border-l-emerald-500/60",
    comment: "bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
  },
  "Perlu Revisi": {
    accent: "border-l-sky-500/60",
    comment: "bg-sky-500/5 text-sky-700 dark:text-sky-300",
  },
  Ditolak: {
    accent: "border-l-destructive/60",
    comment: "bg-destructive/5 text-destructive",
  },
};

interface MySubmission {
  id: string;
  name: string;
  waktuUnggah: string;
  status: UploadStatus;
  adminComment: string | null;
}

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
 * Fetches the peserta's real uploads from /api/kirim-latihan/list so they see
 * their own submissions across reloads, with the status and admin comment set on
 * each row by the admin's review. Falls back to the client review store (which
 * the admin's local save also writes to) for optimistic updates.
 */
export function LatihanStatus() {
  const { peserta } = usePeserta();
  const { reviews } = useReviews();
  const [items, setItems] = useState<MySubmission[]>([]);

  useEffect(() => {
    if (!peserta?.email) {
      setItems([]);
      return;
    }
    let alive = true;
    const url = `/api/kirim-latihan/list?email=${encodeURIComponent(peserta.email)}`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { uploads?: MySubmission[] } | null) => {
        if (alive && Array.isArray(data?.uploads)) setItems(data.uploads);
      })
      .catch(() => {
        // best effort — if the list can't be fetched, we render empty
      });
    return () => {
      alive = false;
    };
  }, [peserta?.email]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-tight">Riwayat & Status</h2>
      <ul className="flex flex-col gap-2">
        {items.map((upload) => {
          // Local optimistic review wins, then the server-stored status.
          const local = reviews[upload.id];
          const status = local?.status ?? upload.status;
          const comment = local?.comment ?? upload.adminComment ?? "";
          const tone = STATUS_TONE[status];
          return (
            <li
              key={upload.id}
              className={cn(
                "bg-card border-border flex flex-col gap-2 rounded-xl border border-l-4 p-3",
                tone.accent,
              )}
            >
              <div className="flex items-center gap-3">
                <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <FileText className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{upload.name}</p>
                  <p className="text-muted-foreground text-xs">
                    Dikirim {formatWaktu(upload.waktuUnggah)}
                  </p>
                </div>
                <StatusBadge status={status} />
              </div>
              {comment && (
                <div
                  className={cn(
                    "flex gap-2 rounded-lg px-3 py-2 text-xs text-pretty",
                    tone.comment,
                  )}
                >
                  <MessageSquare className="mt-0.5 size-3.5 shrink-0 opacity-70" />
                  <span>
                    <span className="font-medium">Catatan admin: </span>
                    {comment}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
