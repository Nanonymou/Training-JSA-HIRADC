import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin/auth";
import { getAdminTrainings } from "@/lib/admin/training-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/training — list every training topic for the admin.
 * Admin-only. Serves the seed modules when no database is configured.
 */
export async function GET() {
  const admin = await readAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Butuh login admin." }, { status: 403 });
  }

  const trainings = await getAdminTrainings();
  return NextResponse.json({ trainings });
}
