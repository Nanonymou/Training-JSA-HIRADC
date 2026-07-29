/**
 * Mock training modules for the CMS.
 *
 * Each is a training topic the admin can manage — title, description, active
 * state, chapter count, and last-updated. The JSA & HIRADC module mirrors the
 * live material (6 chapters). Shaped like a future TRAININGS table so the CMS can
 * be wired to the DB without changing the components.
 */

export interface TrainingModule {
  id: string;
  judul: string;
  deskripsi: string;
  aktif: boolean;
  jumlahBab: number;
  /** ISO timestamp of the last edit. */
  updated: string;
}

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: "jsa-hiradc",
    judul: "Penyusunan dan Pengisian JSA & HIRADC",
    deskripsi:
      "Materi utama Tim QHSE: identifikasi bahaya, penilaian risiko, dan pengendalian sesuai standar perusahaan.",
    aktif: true,
    jumlahBab: 6,
    updated: "2026-07-20T04:00:00.000Z",
  },
  {
    id: "p3k-dasar",
    judul: "Dasar P3K di Tempat Kerja",
    deskripsi:
      "Pengenalan pertolongan pertama pada kecelakaan kerja untuk seluruh personel site.",
    aktif: false,
    jumlahBab: 4,
    updated: "2026-07-12T02:30:00.000Z",
  },
  {
    id: "apar-kebakaran",
    judul: "Penggunaan APAR & Tanggap Kebakaran",
    deskripsi:
      "Prosedur penggunaan alat pemadam api ringan dan langkah tanggap darurat kebakaran.",
    aktif: false,
    jumlahBab: 3,
    updated: "2026-07-05T06:15:00.000Z",
  },
];
