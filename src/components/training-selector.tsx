"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Layers } from "lucide-react";

import type { TrainingModule } from "@/lib/admin/cms-materi";

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
            className="bg-card border-border hover:border-primary/40 flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <BookOpen className="size-4.5" />
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
