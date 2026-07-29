import {
  getPesertaRecords,
  type PesertaFilter,
} from "@/lib/admin/peserta-repository";
import type { PesertaRecord } from "@/lib/admin/peserta";

/**
 * Server-side data for the period report (Laporan Lanjutan).
 *
 * Builds a period-filtered pass-rate report from peserta records: the matching
 * rows, a per-site recap (count / passed / average score), and an overall
 * summary. Reuses the peserta repository, so it works from the DB or the seed.
 * Server-only.
 */

export interface LaporanFilter extends PesertaFilter {
  /** Restrict to these sites; empty/undefined means all sites. */
  sites?: string[];
}

export interface SiteRecap {
  lokasi: string;
  peserta: number;
  lulus: number;
  rata: number;
}

export interface LaporanSummary {
  peserta: number;
  lulus: number;
  rata: number;
}

export interface LaporanPeriode {
  rows: PesertaRecord[];
  recap: SiteRecap[];
  summary: LaporanSummary;
}

function averageScore(rows: PesertaRecord[]): number {
  const scored = rows.filter((r) => r.quizScore !== null);
  if (scored.length === 0) return 0;
  return Math.round(
    scored.reduce((sum, r) => sum + (r.quizScore ?? 0), 0) / scored.length,
  );
}

/** Group rows by site into a recap, most peserta first. */
function recapBySite(rows: PesertaRecord[]): SiteRecap[] {
  const map = new Map<string, PesertaRecord[]>();
  for (const row of rows) {
    const list = map.get(row.lokasi) ?? [];
    list.push(row);
    map.set(row.lokasi, list);
  }
  return [...map.entries()]
    .map(([lokasi, list]) => ({
      lokasi,
      peserta: list.length,
      lulus: list.filter((r) => r.quizStatus === "Lulus").length,
      rata: averageScore(list),
    }))
    .sort((a, b) => b.peserta - a.peserta);
}

export async function getLaporanPeriode(
  filter: LaporanFilter = {},
): Promise<LaporanPeriode> {
  const { sites, ...base } = filter;
  let rows = await getPesertaRecords(base);

  if (sites && sites.length > 0) {
    const set = new Set(sites);
    rows = rows.filter((row) => set.has(row.lokasi));
  }

  return {
    rows,
    recap: recapBySite(rows),
    summary: {
      peserta: rows.length,
      lulus: rows.filter((r) => r.quizStatus === "Lulus").length,
      rata: averageScore(rows),
    },
  };
}
