import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A single static summary card: a labelled metric with an icon and an optional
 * note. The reusable building block for the dashboard's headline row (and any
 * other at-a-glance metric). Presentational only — the caller supplies computed
 * values.
 */
export function SummaryCard({
  label,
  value,
  note,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  note?: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border-border flex flex-col gap-3 rounded-xl border p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
          <Icon className="size-4" />
        </span>
      </div>
      <span className="text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </span>
      {note && <span className="text-muted-foreground text-xs">{note}</span>}
    </div>
  );
}
