import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { getLaporanPeriode } from "@/lib/admin/laporan-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/laporan — period-filtered pass-rate report. Admin-only.
 *
 * Query params: `from`, `to` (YYYY-MM-DD), `q` (name/email search), and `sites`
 * (comma-separated site codes; omit for all). Returns the matching rows, a
 * per-site recap, and an overall summary.
 */
export async function GET(request: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const sites = (params.get("sites") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const laporan = await getLaporanPeriode({
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
    q: params.get("q") ?? undefined,
    sites,
  });

  return NextResponse.json(laporan);
}
