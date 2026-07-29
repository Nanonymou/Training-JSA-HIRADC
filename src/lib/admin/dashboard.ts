import { PESERTA_RECORDS, type PesertaRecord } from "@/lib/admin/peserta";
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

export function getDashboardSummary(
  rows: PesertaRecord[] = PESERTA_RECORDS,
): DashboardSummary {
  const totalPeserta = rows.length;
  const lulus = rows.filter((p) => p.quizStatus === "Lulus").length;
  const scored = rows.filter((p) => p.quizScore !== null);
  const totalUpload = rows.filter((p) => p.uploadStatus === "Terkirim").length;

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

export interface TrendPoint {
  /** ISO day (yyyy-mm-dd). */
  date: string;
  /** Cumulative peserta up to and including this day. */
  peserta: number;
  /** Cumulative peserta who passed the quiz. */
  lulus: number;
}

/**
 * Cumulative attendance/pass trend by day, derived from the records' waktuHadir.
 * Ordered oldest to newest so it reads left to right as growth over time.
 */
export function getProgressTrend(): TrendPoint[] {
  const perDay = new Map<string, { peserta: number; lulus: number }>();
  for (const p of PESERTA_RECORDS) {
    const day = p.waktuHadir.slice(0, 10);
    const cur = perDay.get(day) ?? { peserta: 0, lulus: 0 };
    cur.peserta += 1;
    if (p.quizStatus === "Lulus") cur.lulus += 1;
    perDay.set(day, cur);
  }

  let peserta = 0;
  let lulus = 0;
  return [...perDay.keys()]
    .sort()
    .map((date) => {
      const day = perDay.get(date)!;
      peserta += day.peserta;
      lulus += day.lulus;
      return { date, peserta, lulus };
    });
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
