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

// No seed revision history — versions appear as the admin saves real edits.
export const MATERI_VERSIONS: MateriVersion[] = [];

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

/** All active trainings, for the peserta training selector. */
export function getActiveTrainings(): TrainingModule[] {
  return TRAINING_MODULES.filter((module) => module.aktif);
}

// Only the real training. Additional trainings are added by the admin; there
// are no sample/dummy modules.
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
];
