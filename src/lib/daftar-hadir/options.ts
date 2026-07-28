/**
 * Fixed choices for the Daftar Hadir form.
 *
 * The department is read-only (QHSE) and the nine sites are the company's baku
 * list — both defined once here so the form, validation, and any later reporting
 * agree on the exact set. Kept isomorphic (no server/client marker) so both the
 * form and a future API validator can import it.
 */

/** The department every peserta belongs to — shown read-only on the form. */
export const DEPARTEMEN = "QHSE" as const;

/** Job titles, per the PRD dropdown. */
export const JABATAN_OPTIONS = [
  "Supervisor",
  "Officer",
  "Admin",
  "Manager",
  "HSE",
  "Staff",
] as const;

/** The nine baku sites. */
export const LOKASI_OPTIONS = [
  "ABB",
  "TOP",
  "SSC",
  "SRTA",
  "Pama Asmi",
  "Pama Baya",
  "Pama Aria",
  "Pama Pala",
  "Pama HMNT",
] as const;

export type Jabatan = (typeof JABATAN_OPTIONS)[number];
export type Lokasi = (typeof LOKASI_OPTIONS)[number];
