"use client";

import { useState } from "react";
import { Save } from "lucide-react";

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
  const { reviews, saveReview } = useReviews();
  // A previously saved decision wins over the mock default.
  const saved = reviews[uploadId];
  const [status, setStatus] = useState<UploadStatus>(
    saved?.status ?? initialStatus,
  );
  const [comment, setComment] = useState(saved?.comment ?? initialComment);

  function save() {
    saveReview(uploadId, { status, comment });
    toast({
      title: "Tinjauan disimpan",
      description: `Status: ${status}`,
      variant: "success",
    });
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

      <Button size="sm" onClick={save} className="self-start">
        <Save />
        Simpan Tinjauan
      </Button>
    </div>
  );
}
