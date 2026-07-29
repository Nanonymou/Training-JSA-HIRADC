"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface TrainingDraft {
  judul: string;
  deskripsi: string;
}

/**
 * Form to add a training topic (title + description).
 *
 * Validates that the title is present and hands a clean draft up via `onSubmit`.
 * Meant to live inside the add-training dialog.
 */
export function TrainingForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Tambah Training",
}: {
  initial?: TrainingDraft;
  onSubmit: (draft: TrainingDraft) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [judul, setJudul] = useState(initial?.judul ?? "");
  const [deskripsi, setDeskripsi] = useState(initial?.deskripsi ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!judul.trim()) {
      setError("Judul training wajib diisi.");
      return;
    }
    onSubmit({ judul: judul.trim(), deskripsi: deskripsi.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="training-judul" className="text-sm font-medium">
          Judul Training
        </label>
        <Input
          id="training-judul"
          value={judul}
          onChange={(event) => {
            setJudul(event.target.value);
            if (error) setError(null);
          }}
          placeholder="mis. Dasar P3K di Tempat Kerja"
          aria-invalid={Boolean(error)}
        />
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="training-deskripsi" className="text-sm font-medium">
          Deskripsi
        </label>
        <Textarea
          id="training-deskripsi"
          value={deskripsi}
          onChange={(event) => setDeskripsi(event.target.value)}
          placeholder="Ringkasan singkat training…"
          className="min-h-20"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button type="submit" size="sm">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
