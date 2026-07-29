"use client";

import { BookOpen, Layers, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TRAINING_MODULES } from "@/lib/admin/cms-materi";
import { cn } from "@/lib/utils";

function formatUpdated(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

/**
 * The CMS list of training modules.
 *
 * Each topic shows its title, description, active state, and chapter count with
 * an edit action, plus a toolbar to add a new training. The add form and DOCX
 * upload land in later tasks; this is the layout on mock data.
 */
export function CmsMateriList() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {TRAINING_MODULES.length} topik training
        </p>
        <Button size="sm">
          <Plus />
          Tambah Training
        </Button>
      </div>

      <ul className="flex flex-col gap-3">
        {TRAINING_MODULES.map((module) => (
          <li
            key={module.id}
            className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start"
          >
            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
              <BookOpen className="size-5" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{module.judul}</p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                    module.aktif
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {module.aktif ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5 text-sm text-pretty">
                {module.deskripsi}
              </p>
              <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
                <Layers className="size-3.5" />
                {module.jumlahBab} bab · diperbarui {formatUpdated(module.updated)}
              </p>
            </div>

            <Button variant="outline" size="sm" className="sm:shrink-0">
              <Pencil />
              Kelola
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
