"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A small accessible toggle switch (hand-rolled; no Radix dependency).
 * Controlled via `checked` / `onCheckedChange`.
 */
function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "focus-visible:ring-ring/50 inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent px-0.5 transition-colors outline-none focus-visible:ring-[3px]",
        checked ? "bg-primary" : "bg-muted",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "bg-background size-4 rounded-full shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

export { Switch };
