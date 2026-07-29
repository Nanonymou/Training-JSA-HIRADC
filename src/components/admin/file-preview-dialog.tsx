"use client";

import { FilePreview } from "@/components/admin/file-preview";
import { StatusBadge } from "@/components/admin/status-badge";
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
 * The file preview modal.
 *
 * Opens for a chosen upload and renders its content inline (PDF/image) or a
 * download prompt, with the submitter's context and current status in the
 * header. Controlled by the parent: it's open while an upload is passed, and
 * reports close through `onClose`.
 */
export function FilePreviewDialog({
  upload,
  onClose,
}: {
  upload: AdminUpload | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={upload !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        {upload && (
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
              url={upload.url}
              fileName={upload.fileName}
              previewKind={upload.previewKind}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
