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

export const PESERTA_RECORDS: PesertaRecord[] = [
  {
    id: "p-001",
    nama: "Budi Santoso",
    email: "budi@tpb.co.id",
    jabatan: "Officer",
    lokasi: "ABB",
    quizStatus: "Lulus",
    quizScore: 90,
    uploadStatus: "Terkirim",
    waktuHadir: "2026-07-28T02:15:00.000Z",
  },
  {
    id: "p-002",
    nama: "Siti Aminah",
    email: "siti@tpb.co.id",
    jabatan: "Supervisor",
    lokasi: "TOP",
    quizStatus: "Lulus",
    quizScore: 100,
    uploadStatus: "Terkirim",
    waktuHadir: "2026-07-27T07:40:00.000Z",
  },
  {
    id: "p-003",
    nama: "Andi Wijaya",
    email: "andi@tpb.co.id",
    jabatan: "HSE",
    lokasi: "SSC",
    quizStatus: "Belum Lulus",
    quizScore: 70,
    uploadStatus: "Terkirim",
    waktuHadir: "2026-07-27T03:05:00.000Z",
  },
  {
    id: "p-004",
    nama: "Dewi Lestari",
    email: "dewi@tpb.co.id",
    jabatan: "Admin",
    lokasi: "Pama Asmi",
    quizStatus: "Lulus",
    quizScore: 80,
    uploadStatus: "Belum",
    waktuHadir: "2026-07-26T09:20:00.000Z",
  },
  {
    id: "p-005",
    nama: "Rudi Hartono",
    email: "rudi@tpb.co.id",
    jabatan: "Officer",
    lokasi: "SRTA",
    quizStatus: "Belum Ikut",
    quizScore: null,
    uploadStatus: "Belum",
    waktuHadir: "2026-07-25T06:10:00.000Z",
  },
  {
    id: "p-006",
    nama: "Nur Halimah",
    email: "nur@tpb.co.id",
    jabatan: "Manager",
    lokasi: "Pama Baya",
    quizStatus: "Lulus",
    quizScore: 90,
    uploadStatus: "Terkirim",
    waktuHadir: "2026-07-25T01:35:00.000Z",
  },
  {
    id: "p-007",
    nama: "Joko Prasetyo",
    email: "joko@tpb.co.id",
    jabatan: "Officer",
    lokasi: "Pama Aria",
    quizStatus: "Belum Lulus",
    quizScore: 60,
    uploadStatus: "Belum",
    waktuHadir: "2026-07-24T04:50:00.000Z",
  },
  {
    id: "p-008",
    nama: "Maya Sari",
    email: "maya@tpb.co.id",
    jabatan: "HSE",
    lokasi: "ABB",
    quizStatus: "Lulus",
    quizScore: 100,
    uploadStatus: "Terkirim",
    waktuHadir: "2026-07-24T08:05:00.000Z",
  },
  {
    id: "p-009",
    nama: "Fajar Nugroho",
    email: "fajar@tpb.co.id",
    jabatan: "Supervisor",
    lokasi: "Pama Pala",
    quizStatus: "Belum Ikut",
    quizScore: null,
    uploadStatus: "Belum",
    waktuHadir: "2026-07-23T02:25:00.000Z",
  },
  {
    id: "p-010",
    nama: "Rina Wati",
    email: "rina@tpb.co.id",
    jabatan: "Officer",
    lokasi: "Pama HMNT",
    quizStatus: "Lulus",
    quizScore: 90,
    uploadStatus: "Terkirim",
    waktuHadir: "2026-07-23T06:15:00.000Z",
  },
];
