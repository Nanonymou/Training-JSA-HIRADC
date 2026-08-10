"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Eye,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

import { FilePreviewDialog } from "@/components/admin/file-preview-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { SelectNative } from "@/components/ui/select-native";
import { useReviews } from "@/hooks/use-reviews";
import type { AdminUpload } from "@/lib/admin/latihan";
import { formatBytes } from "@/lib/upload/config";
import type { UploadStatus } from "@/lib/upload/types";

const STATUS_FILTERS: (UploadStatus | "all")[] = [
  "all",
  "Pending",
  "Disetujui",
  "Perlu Revisi",
  "Ditolak",
];

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
export function LatihanReviewList({
  uploads,
}: {
  uploads: AdminUpload[];
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<UploadStatus | "all">("all");
  const { reviews } = useReviews();

  // Effective status = saved review, else the DB-stored status.
  const effectiveStatus = (upload: AdminUpload): UploadStatus =>
    reviews[upload.id]?.status ?? upload.status;

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? uploads
        : uploads.filter(
            (upload) => effectiveStatus(upload) === statusFilter,
          ),
    // effectiveStatus depends on reviews; recompute when either changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploads, statusFilter, reviews],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          {filtered.length} dari {uploads.length} berkas
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium">
            Status
          </label>
          <SelectNative
            id="status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as UploadStatus | "all")
            }
            className="w-40"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "Semua status" : option}
              </option>
            ))}
          </SelectNative>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground rounded-xl border px-4 py-12 text-center text-sm">
          Tidak ada berkas dengan status ini.
        </div>
      ) : (
      <ul className="flex flex-col gap-2">
        {filtered.map((upload, position) => {
          const Icon = fileIcon(upload);
          return (
            <li
              key={upload.id}
              className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
            >
              <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-5" />
              </span>

              {/* Filename opens the preview too, not just the button. */}
              <button
                type="button"
                onClick={() => setIndex(position)}
                className="focus-visible:ring-ring/50 min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-[3px]"
              >
                <span className="hover:text-primary block truncate text-sm font-medium transition-colors">
                  {upload.fileName}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {upload.pesertaNama} · {upload.lokasi} ·{" "}
                  {formatBytes(upload.fileSize)} · {formatWaktu(upload.waktuUnggah)}
                </span>
              </button>

              <div className="flex items-center gap-2 sm:shrink-0">
                <StatusBadge status={effectiveStatus(upload)} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIndex(position)}
                >
                  <Eye />
                  Pratinjau
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/latihan/${upload.id}`}>
                    Detail
                    <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      )}

      <FilePreviewDialog
        uploads={filtered}
        index={index}
        onIndexChange={setIndex}
      />
    </div>
  );
}
