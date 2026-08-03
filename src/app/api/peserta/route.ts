import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { getPesertaRecords } from "@/lib/admin/peserta-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/peserta?lokasi=&q=&from=&to= — filtered peserta records.
 *
 * Admin-only (the data belongs to the management console). Filters by site, a
 * name/email query, and an attendance-date range.
 */
export async function GET(request: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const rows = await getPesertaRecords({
    lokasi: searchParams.get("lokasi") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  return NextResponse.json({ peserta: rows, count: rows.length });
}
