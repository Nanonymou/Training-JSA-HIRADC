"use client";

import {
  CheckCircle2,
  Info,
  Loader2,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type ProcessingState = "processing" | "success" | "error" | "info";

const VARIANT: Record<
  ProcessingState,
  { icon: LucideIcon; box: string; accent: string; spin?: boolean }
> = {
  processing: {
    icon: Loader2,
    box: "border-primary/25 bg-primary/5",
    accent: "text-primary",
    spin: true,
  },
  success: {
    icon: CheckCircle2,
    box: "border-emerald-500/25 bg-emerald-500/5",
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: TriangleAlert,
    box: "border-destructive/30 bg-destructive/5",
    accent: "text-destructive",
  },
  info: {
    icon: Info,
    box: "border-sky-500/25 bg-sky-500/5",
    accent: "text-sky-600 dark:text-sky-400",
  },
};

/**
 * A persistent status notice for document processing.
 *
 * Unlike a transient toast, this stays put to reflect the current state of a
 * DOCX upload/conversion — processing (spinner), success, error, or info — with
 * an optional detail line and dismiss. Presentational; the parent owns the state.
 */
export function ProcessingNotice({
  state,
  title,
  message,
  onDismiss,
}: {
  state: ProcessingState;
  title: string;
  message?: string;
  onDismiss?: () => void;
}) {
  const { icon: Icon, box, accent, spin } = VARIANT[state];

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-3", box)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", accent, spin && "animate-spin")} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {message && (
          <p className="text-muted-foreground mt-0.5 text-xs text-pretty">
            {message}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label="Tutup notifikasi"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-md p-0.5 outline-none focus-visible:ring-[3px]"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
