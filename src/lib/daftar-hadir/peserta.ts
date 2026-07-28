import { DEPARTEMEN, type Jabatan, type Lokasi } from "@/lib/daftar-hadir/options";

/**
 * The shape captured when a peserta signs the Daftar Hadir.
 *
 * This is the identity every later activity (quiz, upload) is recorded against,
 * so the fields mirror the PRD's PESERTA table. `waktuHadir` and `browser` are
 * filled by the system at submit; `ip` is captured server-side later, so it's
 * optional here on the client.
 */
export interface Peserta {
  nama: string;
  email: string;
  jabatan: Jabatan;
  lokasi: Lokasi;
  departemen: typeof DEPARTEMEN;
  /** ISO timestamp captured automatically when the form is submitted. */
  waktuHadir: string;
  /** User agent captured client-side; the server adds the IP. */
  browser?: string;
  ip?: string;
}

/** The form's own fields — what the user actually types/picks. */
export type PesertaInput = Pick<
  Peserta,
  "nama" | "email" | "jabatan" | "lokasi"
>;
