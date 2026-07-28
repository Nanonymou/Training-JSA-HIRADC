/**
 * The quiz question bank (mock).
 *
 * Modelled from the JSA & HIRADC handbook so the questions are real, not filler.
 * Each question stores its options and the index of the correct one (`kunci`),
 * matching the PRD's QUESTIONS table (soal, pilihan, kunci). This is seed data —
 * the backend phase serves the same shape from Postgres, and a later frontend
 * task draws ten at random and shuffles the options. Components should depend on
 * these types, not the array.
 */

export interface QuizQuestion {
  id: string;
  soal: string;
  /** Answer choices, in authoring order. */
  pilihan: string[];
  /** Index into `pilihan` of the correct answer. */
  kunci: number;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-jsa-kepanjangan",
    soal: "Apa kepanjangan dari JSA?",
    pilihan: [
      "Job Safety Analysis",
      "Job Security Assessment",
      "Joint Safety Audit",
      "Job Site Approval",
    ],
    kunci: 0,
  },
  {
    id: "q-hiradc-kepanjangan",
    soal: "HIRADC merupakan singkatan dari…",
    pilihan: [
      "Hazard Inspection, Risk Audit and Document Control",
      "Hazard Identification, Risk Assessment and Determining Control",
      "Health Inspection, Risk Analysis and Direct Control",
      "Hazard Information, Risk Awareness and Data Collection",
    ],
    kunci: 1,
  },
  {
    id: "q-jsa-kapan",
    soal: "Kapan JSA sebaiknya digunakan?",
    pilihan: [
      "Setelah terjadi kecelakaan",
      "Sebelum pekerjaan dilakukan",
      "Saat audit tahunan",
      "Hanya ketika diminta atasan",
    ],
    kunci: 1,
  },
  {
    id: "q-jsa-tujuan",
    soal: "Berikut yang BUKAN merupakan tujuan JSA adalah…",
    pilihan: [
      "Mencegah kecelakaan kerja",
      "Menentukan SOP yang aman",
      "Menambah jumlah pekerja",
      "Mengurangi unsafe action",
    ],
    kunci: 2,
  },
  {
    id: "q-jsa-kolom",
    soal: "Tiga kolom utama dalam pengisian JSA adalah…",
    pilihan: [
      "Langkah pekerjaan, Bahaya/Risiko, Pengendalian",
      "Nama, Tanggal, Lokasi",
      "Severity, Likelihood, Risk",
      "Eliminasi, Substitusi, APD",
    ],
    kunci: 0,
  },
  {
    id: "q-hierarki-terakhir",
    soal: "Dalam Hirarki Pengendalian Risiko, APD berada pada urutan…",
    pilihan: [
      "Pertama (paling utama)",
      "Kedua",
      "Terakhir (paling bawah)",
      "Tidak termasuk hirarki",
    ],
    kunci: 2,
  },
  {
    id: "q-hierarki-teratas",
    soal: "Pengendalian yang paling efektif dalam hirarki adalah…",
    pilihan: ["Administratif", "APD", "Eliminasi", "Safety sign"],
    kunci: 2,
  },
  {
    id: "q-risk-rumus",
    soal: "Bagaimana rumus penilaian risiko pada HIRADC?",
    pilihan: [
      "Risk = Severity + Likelihood",
      "Risk = Severity − Likelihood",
      "Risk = Severity × Likelihood",
      "Risk = Severity ÷ Likelihood",
    ],
    kunci: 2,
  },
  {
    id: "q-risk-kategori",
    soal: "Jika Severity = 4 dan Likelihood = 3, maka nilai Risk dan kategorinya…",
    pilihan: ["7 — LOW", "12 — HIGH", "1 — LOW", "43 — HIGH"],
    kunci: 1,
  },
  {
    id: "q-condition",
    soal: "Pilihan Condition pada HIRADC mencakup…",
    pilihan: [
      "Routine, Non Routine, Emergency",
      "Pagi, Siang, Malam",
      "Ringan, Sedang, Berat",
      "Internal, Eksternal, Campuran",
    ],
    kunci: 0,
  },
  {
    id: "q-severity-fatal",
    soal: "Pada skala Severity 1–5, nilai 5 berarti…",
    pilihan: ["Sangat ringan", "Sedang", "Berat", "Fatal"],
    kunci: 3,
  },
  {
    id: "q-jsa-vs-hiradc",
    soal: "Perbedaan utama JSA dibanding HIRADC adalah…",
    pilihan: [
      "JSA berfokus pada langkah pekerjaan yang rinci",
      "JSA hanya untuk pekerjaan kantor",
      "JSA tidak memerlukan identifikasi bahaya",
      "JSA hanya dibuat oleh manajer",
    ],
    kunci: 0,
  },
];
