"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { FilePreview } from "@/components/admin/file-preview";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminUpload } from "@/lib/admin/latihan";
import { formatBytes } from "@/lib/upload/config";

/**
 * The file preview modal, with navigation across the list.
 *
 * Driven by an index into `uploads`: the modal is open while an index is set, and
 * prev/next step through submissions without closing so an admin can review a
 * batch in one flow. Closing (Esc, the ✕, or the overlay) reports back via
 * `onIndexChange(null)`.
 */
export function FilePreviewDialog({
  uploads,
  index,
  onIndexChange,
}: {
  uploads: AdminUpload[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}) {
  const upload = index !== null ? uploads[index] : null;
  const hasPrev = index !== null && index > 0;
  const hasNext = index !== null && index < uploads.length - 1;

  return (
    <Dialog
      open={upload !== null}
      onOpenChange={(open) => !open && onIndexChange(null)}
    >
      <DialogContent className="max-w-3xl">
        {upload && index !== null && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="min-w-0 flex-1 truncate">
                  {upload.fileName}
                </DialogTitle>
                <StatusBadge status={upload.status} />
              </div>
              <DialogDescription>
                {upload.pesertaNama} · {upload.lokasi} ·{" "}
                {formatBytes(upload.fileSize)}
              </DialogDescription>
            </DialogHeader>

            <FilePreview
              key={upload.id}
              url={upload.url}
              fileName={upload.fileName}
              previewKind={upload.previewKind}
            />

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onIndexChange(index - 1)}
                disabled={!hasPrev}
              >
                <ChevronLeft />
                Sebelumnya
              </Button>
              <span className="text-muted-foreground text-xs tabular-nums">
                {index + 1} dari {uploads.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onIndexChange(index + 1)}
                disabled={!hasNext}
              >
                Berikutnya
                <ChevronRight />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
