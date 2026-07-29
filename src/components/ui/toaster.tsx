"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A small, app-wide toast system.
 *
 * Toasts live in a module store so any component can raise one by calling
 * `toast(...)` without threading a context through the tree; `<Toaster />` (once,
 * in the root layout) subscribes and renders the stack. Each auto-dismisses and
 * can be closed early. Used for transient confirmations like a successful upload.
 */

type ToastVariant = "success" | "error" | "info";

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

const AUTO_DISMISS_MS = 4000;

const listeners = new Set<() => void>();
let toasts: ToastData[] = [];

function emit() {
  for (const listener of listeners) listener();
}

function dismiss(id: string) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

/** Raise a toast. Safe to call from any client event handler. */
export function toast(input: {
  title: string;
  description?: string;
  variant?: ToastVariant;
}) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  toasts = [...toasts, { variant: "info", ...input, id }];
  emit();
  setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
}

const VARIANT: Record<
  ToastVariant,
  { icon: LucideIcon; accent: string }
> = {
  success: { icon: CheckCircle2, accent: "text-emerald-600 dark:text-emerald-400" },
  error: { icon: TriangleAlert, accent: "text-destructive" },
  info: { icon: Info, accent: "text-primary" },
};

export function Toaster() {
  const reduceMotion = useReducedMotion();
  const [, force] = useState(0);

  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end">
      <AnimatePresence initial={false}>
        {toasts.map((item) => {
          const { icon: Icon, accent } = VARIANT[item.variant];
          return (
            <motion.div
              key={item.id}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              role="status"
              className="bg-card border-border pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-3 shadow-lg"
            >
              <Icon className={cn("mt-0.5 size-5 shrink-0", accent)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-muted-foreground truncate text-xs">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => dismiss(item.id)}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-md p-0.5 outline-none focus-visible:ring-[3px]"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
