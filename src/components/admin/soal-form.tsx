"use client";

import { useState } from "react";

import { SoalCategorySelect } from "@/components/admin/soal-category-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  emptyDraft,
  hasErrors,
  validateDraft,
  type SoalDraft,
  type SoalErrors,
} from "@/lib/admin/soal-draft";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * Form to add or edit a quiz question.
 *
 * The question text, its options, and a radio to mark the correct one; the
 * correct answer must be a filled option. Validates on submit and hands a clean
 * draft up via `onSubmit`. Controlled internally from `initial` (defaults to a
 * blank draft), so it works for both create and edit.
 */
export function SoalForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Simpan Soal",
}: {
  initial?: SoalDraft;
  onSubmit: (draft: SoalDraft) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [draft, setDraft] = useState<SoalDraft>(initial ?? emptyDraft());
  const [errors, setErrors] = useState<SoalErrors>({});

  function setOption(index: number, value: string) {
    setDraft((current) => {
      const pilihan = [...current.pilihan];
      pilihan[index] = value;
      return { ...current, pilihan };
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validateDraft(draft);
    setErrors(found);
    if (hasErrors(found)) return;
    onSubmit({
      soal: draft.soal.trim(),
      pilihan: draft.pilihan.map((option) => option.trim()),
      kunci: draft.kunci,
      kategori: draft.kategori,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="soal" className="text-sm font-medium">
          Pertanyaan
        </label>
        <Textarea
          id="soal"
          value={draft.soal}
          onChange={(event) =>
            setDraft((current) => ({ ...current, soal: event.target.value }))
          }
          placeholder="Tulis pertanyaan…"
          aria-invalid={Boolean(errors.soal)}
        />
        {errors.soal && <p className="text-destructive text-xs">{errors.soal}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="kategori" className="text-sm font-medium">
          Kategori
        </label>
        <SoalCategorySelect
          id="kategori"
          value={draft.kategori}
          onChange={(value) =>
            setDraft((current) => ({ ...current, kategori: value }))
          }
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">
          Pilihan jawaban{" "}
          <span className="text-muted-foreground font-normal">
            (pilih yang benar)
          </span>
        </legend>
        {draft.pilihan.map((option, index) => {
          const correct = draft.kunci === index;
          const optionError = errors.pilihan?.[index];
          return (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label
                  className={cn(
                    "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-xs font-semibold",
                    correct
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border text-muted-foreground",
                  )}
                  title={`Tandai ${LETTERS[index]} sebagai jawaban benar`}
                >
                  <input
                    type="radio"
                    name="kunci"
                    className="sr-only"
                    checked={correct}
                    onChange={() =>
                      setDraft((current) => ({ ...current, kunci: index }))
                    }
                  />
                  {LETTERS[index]}
                </label>
                <Input
                  value={option}
                  onChange={(event) => setOption(index, event.target.value)}
                  placeholder={`Pilihan ${LETTERS[index]}`}
                  aria-invalid={Boolean(optionError)}
                  aria-label={`Pilihan ${LETTERS[index]}`}
                />
              </div>
              {optionError && (
                <p className="text-destructive pl-10 text-xs">{optionError}</p>
              )}
            </div>
          );
        })}
        {errors.kunci && <p className="text-destructive text-xs">{errors.kunci}</p>}
      </fieldset>

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
