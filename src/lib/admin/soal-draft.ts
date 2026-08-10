import { DEFAULT_CATEGORY } from "@/lib/admin/soal-categories";

/**
 * A quiz-question draft as the add/edit form produces it, plus its validation.
 *
 * Mirrors QUIZ_QUESTIONS (soal, four options, the correct index) plus a category,
 * so a draft can be saved into the bank unchanged. Validation is a pure function
 * shared by the form and, later, a server route.
 */

export interface SoalDraft {
  soal: string;
  pilihan: string[];
  kunci: number;
  kategori: string;
}

export const OPTION_COUNT = 4;

export function emptyDraft(): SoalDraft {
  return {
    soal: "",
    pilihan: Array(OPTION_COUNT).fill(""),
    kunci: 0,
    kategori: DEFAULT_CATEGORY,
  };
}

export interface SoalErrors {
  soal?: string;
  pilihan?: (string | undefined)[];
  kunci?: string;
}

export function validateDraft(draft: SoalDraft): SoalErrors {
  const errors: SoalErrors = {};

  if (!draft.soal.trim()) errors.soal = "Pertanyaan wajib diisi.";

  const optionErrors = draft.pilihan.map((option) =>
    option.trim() ? undefined : "Wajib diisi.",
  );
  if (optionErrors.some(Boolean)) errors.pilihan = optionErrors;

  if (
    draft.kunci < 0 ||
    draft.kunci >= draft.pilihan.length ||
    !draft.pilihan[draft.kunci]?.trim()
  ) {
    errors.kunci = "Pilih jawaban benar yang sudah diisi.";
  }

  return errors;
}

export function hasErrors(errors: SoalErrors): boolean {
  return Boolean(
    errors.soal ||
      errors.kunci ||
      (errors.pilihan && errors.pilihan.some(Boolean)),
  );
}

/** Coerce an untrusted request body into a SoalDraft (validate separately). */
export function coerceDraft(body: unknown): SoalDraft {
  const source = (body ?? {}) as Record<string, unknown>;
  const pilihan = Array.isArray(source.pilihan)
    ? source.pilihan.map((p) => (typeof p === "string" ? p : ""))
    : [];
  return {
    soal: typeof source.soal === "string" ? source.soal : "",
    pilihan,
    kunci: typeof source.kunci === "number" ? source.kunci : 0,
    kategori:
      typeof source.kategori === "string" ? source.kategori : DEFAULT_CATEGORY,
  };
}
