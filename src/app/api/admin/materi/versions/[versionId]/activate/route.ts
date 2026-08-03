import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { setCurrentVersion } from "@/lib/admin/cms-repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/materi/versions/[versionId]/activate — make this version the
 * live material. Admin-only; unsets the others automatically so the peserta view
 * follows the newly active version. 404 for an unknown version.
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ versionId: string }> },
) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const { versionId } = await context.params;
  const ok = await setCurrentVersion(versionId);
  if (!ok) {
    return NextResponse.json(
      { error: "Versi tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, versionId });
}
