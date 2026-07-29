import type { UploadStatus } from "@/lib/upload/types";
import { cn } from "@/lib/utils";

/** Colour per review status, reused across the review and reporting screens. */
const STATUS_STYLE: Record<UploadStatus, string> = {
  Pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Disetujui: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "Perlu Revisi": "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  Ditolak: "bg-destructive/15 text-destructive",
};

export function StatusBadge({
  status,
  className,
}: {
  status: UploadStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_STYLE[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
