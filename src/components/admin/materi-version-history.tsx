import { History, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MATERI_VERSIONS } from "@/lib/admin/cms-materi";

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
 * Revision history for a training's material.
 *
 * A timeline of saved versions, newest first, each with its note, author, time,
 * and chapter count; the live one is badged and older ones offer a restore. Runs
 * on mock data; wiring restore is a later concern.
 */
export function MateriVersionHistory() {
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
                <span
                  className={
                    version.current
                      ? "bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      : "bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  }
                >
                  v{version.version}
                </span>
                {!isLast && <span className="bg-border w-px flex-1" />}
              </div>

              <div className={isLast ? "pb-0" : "pb-5"}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">Versi {version.version}</p>
                  {version.current ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Aktif
                    </span>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <RotateCcw />
                      Pulihkan
                    </Button>
                  )}
                </div>
                <p className="text-foreground/90 mt-0.5 text-sm text-pretty">
                  {version.catatan}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {version.jumlahBab} bab · {version.updatedBy} ·{" "}
                  {formatWaktu(version.updatedAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
