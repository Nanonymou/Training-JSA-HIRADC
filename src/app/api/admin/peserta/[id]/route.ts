import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { getPesertaById } from "@/lib/admin/peserta-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/peserta/[id] — one peserta's detail (attendance, quiz outcome,
 * upload state). Admin-only. Serves the seed record without a DB; 404 if none.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const { id } = await context.params;
  const peserta = await getPesertaById(id);
  if (!peserta) {
    return NextResponse.json(
      { error: "Peserta tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ peserta });
}
