"use client";

import { useState } from "react";
import { Eye, FileSpreadsheet, FileText, Image as ImageIcon } from "lucide-react";

import { FilePreviewDialog } from "@/components/admin/file-preview-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { ADMIN_UPLOADS, type AdminUpload } from "@/lib/admin/latihan";
import { formatBytes } from "@/lib/upload/config";

function fileIcon(upload: AdminUpload) {
  if (upload.previewKind === "image") return ImageIcon;
  if (upload.fileExt === "xls" || upload.fileExt === "xlsx") {
    return FileSpreadsheet;
  }
  return FileText;
}

function formatWaktu(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * The admin list of submitted latihan files, each with a Preview action.
 *
 * Every row shows who submitted what, from where, when, and its review status,
 * with a Pratinjau button that opens a dialog for the file. The dialog is a shell
 * here — the actual inline PDF/image rendering lands in the next task; Office
 * files that can't be shown inline are flagged. Runs on mock data for now.
 */
export function LatihanReviewList() {
  const [preview, setPreview] = useState<AdminUpload | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {ADMIN_UPLOADS.map((upload) => {
          const Icon = fileIcon(upload);
          return (
            <li
              key={upload.id}
              className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
            >
              <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {upload.fileName}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {upload.pesertaNama} · {upload.lokasi} ·{" "}
                  {formatBytes(upload.fileSize)} · {formatWaktu(upload.waktuUnggah)}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                <StatusBadge status={upload.status} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreview(upload)}
                >
                  <Eye />
                  Pratinjau
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <FilePreviewDialog upload={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
