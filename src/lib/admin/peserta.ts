/**
 * Mock peserta records for the Data Peserta screen.
 *
 * One row per peserta with their attendance, quiz outcome, and upload state —
 * the columns the admin table shows and (later) filters and exports. Shaped so it
 * can be swapped for a DB-backed query without touching the table.
 */

export type QuizStatus = "Lulus" | "Belum Lulus" | "Belum Ikut";
export type UploadState = "Terkirim" | "Belum";

export interface PesertaRecord {
  id: string;
  nama: string;
  email: string;
  jabatan: string;
  lokasi: string;
  quizStatus: QuizStatus;
  /** Latest quiz score, or null if they haven't taken it. */
  quizScore: number | null;
  uploadStatus: UploadState;
  /** Attendance timestamp (ISO). */
  waktuHadir: string;
}

// No seed peserta — the admin screens show only real registrations.
export const PESERTA_RECORDS: PesertaRecord[] = [];
