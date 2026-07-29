import { PESERTA_RECORDS } from "@/lib/admin/peserta";
import { LOKASI_OPTIONS } from "@/lib/daftar-hadir/options";

/**
 * Aggregates for the monitoring dashboard, derived from the peserta records.
 *
 * Kept as pure functions over the mock data so the tiles and charts read one
 * consistent source; swapping in DB-backed queries later won't change the shapes.
 */

export interface DashboardSummary {
  totalPeserta: number;
  lulus: number;
  /** Percentage of peserta who passed the quiz, 0–100. */
  kelulusan: number;
  /** Average quiz score across peserta who took it, rounded. */
  rataNilai: number;
  totalUpload: number;
}

export function getDashboardSummary(): DashboardSummary {
  const totalPeserta = PESERTA_RECORDS.length;
  const lulus = PESERTA_RECORDS.filter((p) => p.quizStatus === "Lulus").length;
  const scored = PESERTA_RECORDS.filter((p) => p.quizScore !== null);
  const totalUpload = PESERTA_RECORDS.filter(
    (p) => p.uploadStatus === "Terkirim",
  ).length;

  const rataNilai =
    scored.length === 0
      ? 0
      : Math.round(
          scored.reduce((sum, p) => sum + (p.quizScore ?? 0), 0) / scored.length,
        );

  const kelulusan =
    totalPeserta === 0 ? 0 : Math.round((lulus / totalPeserta) * 100);

  return { totalPeserta, lulus, kelulusan, rataNilai, totalUpload };
}

export interface LokasiStat {
  lokasi: string;
  peserta: number;
  lulus: number;
  upload: number;
}

/** Per-site tallies, one row per baku site (zero-filled when empty). */
export function getLokasiStats(): LokasiStat[] {
  return LOKASI_OPTIONS.map((lokasi) => {
    const rows = PESERTA_RECORDS.filter((p) => p.lokasi === lokasi);
    return {
      lokasi,
      peserta: rows.length,
      lulus: rows.filter((p) => p.quizStatus === "Lulus").length,
      upload: rows.filter((p) => p.uploadStatus === "Terkirim").length,
    };
  });
}
