"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { useReviews } from "@/hooks/use-reviews";
import type { UploadStatus } from "@/lib/upload/types";

const STATUS_OPTIONS: UploadStatus[] = [
  "Pending",
  "Disetujui",
  "Perlu Revisi",
  "Ditolak",
];

/**
 * Review controls for a submission: status and an admin comment.
 *
 * Holds the status and comment locally (seeded from the upload) and saves them
 * together with a toast, ahead of a real API. The badge tracks the selected
 * status; save/notify wiring lands later.
 */
export function ReviewPanel({
  uploadId,
  initialStatus,
  initialComment = "",
}: {
  uploadId: string;
  initialStatus: UploadStatus;
  initialComment?: string;
}) {
  const { saveReview } = useReviews();
  // Server truth wins on load — the localStorage cache is optimistic-only, so
  // opening the page always shows what the DB actually holds (previous stale
  // cache from another admin's device is overwritten).
  const [status, setStatus] = useState<UploadStatus>(initialStatus);
  const [comment, setComment] = useState(initialComment);
  const [saving, setSaving] = useState(false);

  // Prime the shared review cache from server truth on mount so sibling views
  // (EmailPreview, LatihanReviewList) see the current DB state, not a stale entry.
  useEffect(() => {
    saveReview(uploadId, { status: initialStatus, comment: initialComment });
  }, [uploadId, initialStatus, initialComment, saveReview]);

  async function save() {
    setSaving(true);
    // Optimistic local save so the list/peserta view update immediately.
    saveReview(uploadId, { status, comment });
    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, status, comment }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({
        title: "Tinjauan disimpan",
        description: `Status: ${status}`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Gagal menyimpan tinjauan",
        description: "Cek koneksi lalu coba lagi.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold tracking-tight">Tinjauan</p>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-status" className="text-sm font-medium">
          Status Review
        </label>
        <SelectNative
          id="review-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as UploadStatus)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectNative>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-comment" className="text-sm font-medium">
          Komentar untuk peserta
        </label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="mis. Lengkapi kolom pengendalian pada langkah 3…"
          className="min-h-24"
        />
        <p className="text-muted-foreground text-xs">
          Komentar ini akan dikirim ke peserta saat status diperbarui.
        </p>
      </div>

      <Button
        size="sm"
        onClick={save}
        disabled={saving}
        className="self-start"
      >
        {saving ? <Loader2 className="animate-spin" /> : <Save />}
        Simpan Tinjauan
      </Button>
    </div>
  );
}
