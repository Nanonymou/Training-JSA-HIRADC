"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BookOpen, Check, Layers } from "lucide-react";

import type { TrainingModule } from "@/lib/admin/cms-materi";
import { cn } from "@/lib/utils";

const SELECTED_KEY = "training-jsa-hiradc:selected-training:v1";

// The remembered selection lives in localStorage, read through
// useSyncExternalStore so the client hydrates from the server's null snapshot
// without a mismatch, then re-reads once mounted.
const selectedListeners = new Set<() => void>();

function subscribeSelected(onChange: () => void): () => void {
  selectedListeners.add(onChange);
  return () => {
    selectedListeners.delete(onChange);
  };
}

function getSelectedSnapshot(): string | null {
  try {
    return window.localStorage.getItem(SELECTED_KEY);
  } catch {
    return null;
  }
}

function getSelectedServerSnapshot(): string | null {
  return null;
}

function writeSelected(id: string): void {
  try {
    window.localStorage.setItem(SELECTED_KEY, id);
  } catch {
    // Ignore — navigation still proceeds.
  }
  selectedListeners.forEach((listener) => listener());
}

/**
 * The peserta training selector.
 *
 * Renders the active trainings as cards routing into the material. Seeded with a
 * server list so it shows immediately, then refreshes from /api/training (added
 * in the backend phase); if the endpoint isn't available the seed still shows.
 */
export function TrainingSelector({
  initial,
}: {
  initial: TrainingModule[];
}) {
  const [trainings, setTrainings] = useState<TrainingModule[]>(initial);
  const selected = useSyncExternalStore(
    subscribeSelected,
    getSelectedSnapshot,
    getSelectedServerSnapshot,
  );

  useEffect(() => {
    let alive = true;
    fetch("/api/training")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { trainings?: TrainingModule[] } | null) => {
        if (alive && Array.isArray(data?.trainings)) {
          setTrainings(data.trainings);
        }
      })
      .catch(() => {
        // Endpoint not available yet — keep the seed list.
      });
    return () => {
      alive = false;
    };
  }, []);

  if (trainings.length === 0) return null;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <p className="text-muted-foreground text-sm font-medium">Pilih training</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {trainings.map((training) => (
          <Link
            key={training.id}
            href="/materi"
            onClick={() => writeSelected(training.id)}
            aria-current={selected === training.id ? "true" : undefined}
            className={cn(
              "bg-card flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
              selected === training.id
                ? "border-primary"
                : "border-border hover:border-primary/40",
            )}
          >
            <span className="flex items-center justify-between">
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                <BookOpen className="size-4.5" />
              </span>
              {selected === training.id && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3" />
                  Dipilih
                </span>
              )}
            </span>
            <span className="text-sm font-semibold tracking-tight text-pretty">
              {training.judul}
            </span>
            <span className="text-muted-foreground line-clamp-2 text-xs text-pretty">
              {training.deskripsi}
            </span>
            <span className="text-muted-foreground mt-1 inline-flex items-center gap-1.5 text-xs">
              <Layers className="size-3.5" />
              {training.jumlahBab} bab
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
