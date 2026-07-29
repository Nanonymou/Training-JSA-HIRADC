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

/** One saved revision of a training's material. */
export interface MateriVersion {
  id: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
  jumlahBab: number;
  catatan: string;
  /** The version currently live. */
  current: boolean;
}

/** Mock revision history for a training, newest first. */
export const MATERI_VERSIONS: MateriVersion[] = [
  {
    id: "v3",
    version: 3,
    updatedBy: "Admin QHSE",
    updatedAt: "2026-07-20T04:00:00.000Z",
    jumlahBab: 6,
    catatan: "Tambah bab Cara Mengisi HIRADC & perbaikan matriks risiko.",
    current: true,
  },
  {
    id: "v2",
    version: 2,
    updatedBy: "Admin QHSE",
    updatedAt: "2026-07-08T03:20:00.000Z",
    jumlahBab: 5,
    catatan: "Revisi contoh JSA menggoreng dan penambahan latihan.",
    current: false,
  },
  {
    id: "v1",
    version: 1,
    updatedBy: "Admin QHSE",
    updatedAt: "2026-06-30T06:45:00.000Z",
    jumlahBab: 4,
    catatan: "Konversi awal dari dokumen DOCX.",
    current: false,
  },
];

/** The material version currently live, or null. */
export function getCurrentMateriVersion(): MateriVersion | null {
  return MATERI_VERSIONS.find((version) => version.current) ?? null;
}

/** A chapter produced by converting a DOCX — title plus its section headings. */
export interface ConvertedChapter {
  id: string;
  title: string;
  sections: string[];
}

/**
 * A sample conversion result, mirroring the JSA & HIRADC material, used to preview
 * what a DOCX becomes before it's saved.
 */
export const CONVERSION_PREVIEW: ConvertedChapter[] = [
  {
    id: "pendahuluan",
    title: "Pendahuluan",
    sections: ["Makna Training", "Tujuan Training", "Kompetensi yang Dikuasai"],
  },
  {
    id: "konsep-jsa",
    title: "Konsep JSA",
    sections: ["Apa itu JSA?", "Tujuan JSA"],
  },
  {
    id: "konsep-hiradc",
    title: "Konsep HIRADC",
    sections: ["Apa itu HIRADC?", "Yang Dinilai HIRADC"],
  },
  {
    id: "perbedaan",
    title: "Perbedaan JSA & HIRADC",
    sections: ["JSA vs HIRADC"],
  },
  {
    id: "cara-mengisi-jsa",
    title: "Cara Mengisi JSA",
    sections: ["Bagian yang Diisi", "Tiga Kolom Utama", "Latihan JSA"],
  },
  {
    id: "cara-mengisi-hiradc",
    title: "Cara Mengisi HIRADC",
    sections: ["Komponen HIRADC", "Enam Langkah Pengisian"],
  },
];

/** The training currently active (shown to peserta), or null if none. */
export function getActiveTraining(): TrainingModule | null {
  return TRAINING_MODULES.find((module) => module.aktif) ?? null;
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
