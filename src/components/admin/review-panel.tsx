"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/admin/status-badge";
import { SelectNative } from "@/components/ui/select-native";
import { toast } from "@/components/ui/toaster";
import type { UploadStatus } from "@/lib/upload/types";

const STATUS_OPTIONS: UploadStatus[] = [
  "Pending",
  "Disetujui",
  "Perlu Revisi",
  "Ditolak",
];

/**
 * Review controls for a submission — the status dropdown for now.
 *
 * Holds the review status locally (seeded from the upload) and reflects changes
 * immediately with a badge and a toast, ahead of a real API. The comment field
 * and save/notify land in later tasks.
 */
export function ReviewPanel({
  initialStatus,
}: {
  uploadId: string;
  initialStatus: UploadStatus;
}) {
  const [status, setStatus] = useState<UploadStatus>(initialStatus);

  function change(next: UploadStatus) {
    setStatus(next);
    toast({
      title: "Status review diperbarui",
      description: next,
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
          onChange={(event) => change(event.target.value as UploadStatus)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectNative>
      </div>
    </div>
  );
}
