import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { getMateriVersions } from "@/lib/admin/cms-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/materi/versions?training=jsa-hiradc — a training's material
 * revision history, newest first. Admin-only.
 */
export async function GET(request: Request) {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const trainingId = searchParams.get("training") ?? "jsa-hiradc";
  const versions = await getMateriVersions(trainingId);

  return NextResponse.json({ versions });
}
