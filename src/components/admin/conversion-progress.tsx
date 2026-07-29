"use client";

import { Check, Loader2, TriangleAlert } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type ConversionStatus =
  | "idle"
  | "uploading"
  | "converting"
  | "done"
  | "error";

/**
 * Two-step progress for uploading a DOCX and converting it to interactive
 * material.
 *
 * Presentational: the parent drives `status` (and `progress` while uploading).
 * Step one fills as the file uploads; step two spins while the document is
 * converted into chapters; both check off when done. Errors surface a message.
 * Hidden while idle.
 */
export function ConversionProgress({
  status,
  progress = 0,
  errorMessage,
}: {
  status: ConversionStatus;
  progress?: number;
  errorMessage?: string;
}) {
  if (status === "idle") return null;

  const uploadDone =
    status === "converting" || status === "done" || status === "error";
  const convertActive = status === "converting";
  const convertDone = status === "done";

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-4">
      <Step
        label="Mengunggah dokumen"
        state={
          status === "uploading" ? "active" : uploadDone ? "done" : "pending"
        }
      >
        {status === "uploading" && (
          <div className="mt-2 flex flex-col gap-1">
            <Progress value={progress} aria-label="Mengunggah dokumen" />
            <span className="text-muted-foreground text-xs tabular-nums">
              {Math.round(progress * 100)}%
            </span>
          </div>
        )}
      </Step>

      <Step
        label="Mengonversi ke materi interaktif"
        state={convertDone ? "done" : convertActive ? "active" : "pending"}
      >
        {convertActive && (
          <p className="text-muted-foreground mt-1 text-xs">
            Memproses bab dan konten…
          </p>
        )}
      </Step>

      {status === "done" && (
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Materi berhasil dikonversi.
        </p>
      )}
      {status === "error" && (
        <p className="text-destructive flex items-center gap-1.5 text-sm">
          <TriangleAlert className="size-4 shrink-0" />
          {errorMessage ?? "Gagal memproses dokumen."}
        </p>
      )}
    </div>
  );
}

function Step({
  label,
  state,
  children,
}: {
  label: string;
  state: "pending" | "active" | "done";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          state === "done"
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : state === "active"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
        )}
      >
        {state === "done" ? (
          <Check className="size-4" />
        ) : state === "active" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <span className="bg-muted-foreground/40 size-1.5 rounded-full" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm",
            state === "pending" ? "text-muted-foreground" : "font-medium",
          )}
        >
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}
