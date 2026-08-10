import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import {
  getDashboardSummary,
  getLokasiStats,
  getProgressTrend,
} from "@/lib/admin/dashboard";
import { getPesertaRecords } from "@/lib/admin/peserta-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard?lokasi= — monitoring statistics.
 *
 * Admin-only. Derives the headline summary, per-site tallies, and the cumulative
 * trend from the peserta records (DB-or-seed) — no separate stats table, so the
 * numbers can't drift from the source. An optional `lokasi` scopes the summary
 * and trend to one site.
 */
export async function GET(request: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const lokasi = searchParams.get("lokasi") ?? undefined;

  const all = await getPesertaRecords();
  const scoped =
    lokasi && lokasi !== "all"
      ? all.filter((p) => p.lokasi === lokasi)
      : all;

  return NextResponse.json({
    summary: getDashboardSummary(scoped),
    lokasiStats: getLokasiStats(all),
    trend: getProgressTrend(scoped),
  });
}
