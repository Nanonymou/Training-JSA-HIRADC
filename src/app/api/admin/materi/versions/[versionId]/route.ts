import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { getMateriVersionPreview } from "@/lib/admin/cms-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/materi/versions/[versionId] — the chapters of one material
 * version, for preview before restoring. Admin-only; 404 for an unknown version.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ versionId: string }> },
) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const { versionId } = await context.params;
  const chapters = await getMateriVersionPreview(versionId);
  if (!chapters) {
    return NextResponse.json(
      { error: "Versi tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ chapters });
}
