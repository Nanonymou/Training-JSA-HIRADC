import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { getSiteGabungan } from "@/lib/admin/laporan-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/laporan/site — combined per-site rollup for the period.
 * Admin-only. Same query params as /api/admin/laporan (from/to/q/sites).
 * Returns attendance, quiz outcomes, and upload counts grouped by site.
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

  const rollup = await getSiteGabungan({
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
    q: params.get("q") ?? undefined,
    sites,
  });

  return NextResponse.json({ sites: rollup });
}
