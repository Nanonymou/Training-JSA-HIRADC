"use client";

import { useState } from "react";
import { Eye, History, RotateCcw } from "lucide-react";

import { ConversionResult } from "@/components/admin/conversion-result";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CONVERSION_PREVIEW,
  MATERI_VERSIONS,
  type MateriVersion,
} from "@/lib/admin/cms-materi";

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
 * Revision history for a training's material, with per-version preview.
 *
 * A newest-first timeline; each version can be previewed in a dialog showing the
 * chapters that version held (older ones have fewer), so the admin can inspect
 * before restoring. The live version is badged; older ones also offer restore.
 * Runs on mock data.
 */
export function MateriVersionHistory() {
  const [preview, setPreview] = useState<MateriVersion | null>(null);

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <History className="text-muted-foreground size-4" />
        <p className="text-sm font-semibold tracking-tight">Riwayat Versi</p>
      </div>

      <ol className="flex flex-col">
        {MATERI_VERSIONS.map((version, index) => {
          const isLast = index === MATERI_VERSIONS.length - 1;
          return (
            <li key={version.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="bg-muted text-muted-foreground data-[current=true]:bg-primary data-[current=true]:text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold" data-current={version.current}>
                  v{version.version}
                </span>
                {!isLast && <span className="bg-border w-px flex-1" />}
              </div>

              <div className={isLast ? "pb-0" : "pb-5"}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">Versi {version.version}</p>
                  {version.current && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-foreground/90 mt-0.5 text-sm text-pretty">
                  {version.catatan}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {version.jumlahBab} bab · {version.updatedBy} ·{" "}
                  {formatWaktu(version.updatedAt)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setPreview(version)}
                  >
                    <Eye />
                    Pratinjau
                  </Button>
                  {!version.current && (
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <RotateCcw />
                      Pulihkan
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <Dialog
        open={preview !== null}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent className="max-w-lg">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle>Pratinjau Versi {preview.version}</DialogTitle>
                <DialogDescription>
                  {preview.jumlahBab} bab · {formatWaktu(preview.updatedAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ConversionResult
                  chapters={CONVERSION_PREVIEW.slice(0, preview.jumlahBab)}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
