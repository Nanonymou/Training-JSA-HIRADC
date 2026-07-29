/**
 * Question categories for the bank soal.
 *
 * A fixed list so the form dropdown, the list badges, and any filtering agree.
 * `inferCategory` gives seed questions a sensible category from their id keyword.
 */

export const SOAL_CATEGORIES = [
  "Umum",
  "JSA",
  "HIRADC",
  "Penilaian Risiko",
  "Pengendalian",
] as const;

export type SoalCategory = (typeof SOAL_CATEGORIES)[number];

export const DEFAULT_CATEGORY: SoalCategory = "Umum";

/** Best-effort category for a seed question, from its id. */
export function inferCategory(id: string): SoalCategory {
  if (id.includes("jsa")) return "JSA";
  if (
    id.includes("hiradc") ||
    id.includes("hierarki") ||
    id.includes("severity") ||
    id.includes("condition")
  ) {
    return "HIRADC";
  }
  if (id.includes("risk")) return "Penilaian Risiko";
  return DEFAULT_CATEGORY;
}
