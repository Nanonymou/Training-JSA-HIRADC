import {
  JABATAN_OPTIONS,
  LOKASI_OPTIONS,
  type Jabatan,
  type Lokasi,
} from "@/lib/daftar-hadir/options";

/**
 * Validation for the Daftar Hadir form.
 *
 * Plain functions so both the form (as the user types / on submit) and a future
 * API route can share one source of truth for what counts as valid. Messages are
 * in Indonesian, ready to show inline.
 */

// Pragmatic email shape: something@something.tld. Deliberately not RFC-exhaustive
// — email is required for notifications, so this catches the common mistakes
// without rejecting valid addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export interface PesertaFormValues {
  nama: string;
  email: string;
  jabatan: string;
  lokasi: string;
}

export type PesertaFormErrors = Partial<
  Record<keyof PesertaFormValues, string>
>;

/** Validate one field; returns an error message or undefined when it's fine. */
export function validateField(
  field: keyof PesertaFormValues,
  value: string,
): string | undefined {
  const trimmed = value.trim();

  switch (field) {
    case "nama":
      if (!trimmed) return "Nama lengkap wajib diisi.";
      if (trimmed.length < 3) return "Nama terlalu pendek.";
      return undefined;
    case "email":
      if (!trimmed) return "Email wajib diisi untuk notifikasi.";
      if (!isValidEmail(trimmed)) return "Format email tidak valid.";
      return undefined;
    case "jabatan":
      if (!trimmed) return "Pilih jabatan.";
      if (!JABATAN_OPTIONS.includes(trimmed as Jabatan))
        return "Jabatan tidak valid.";
      return undefined;
    case "lokasi":
      if (!trimmed) return "Pilih lokasi site.";
      if (!LOKASI_OPTIONS.includes(trimmed as Lokasi))
        return "Lokasi tidak valid.";
      return undefined;
    default:
      return undefined;
  }
}

/** Validate every field; empty object means the form is ready to submit. */
export function validateForm(values: PesertaFormValues): PesertaFormErrors {
  const errors: PesertaFormErrors = {};
  (Object.keys(values) as (keyof PesertaFormValues)[]).forEach((field) => {
    const message = validateField(field, values[field]);
    if (message) errors[field] = message;
  });
  return errors;
}
